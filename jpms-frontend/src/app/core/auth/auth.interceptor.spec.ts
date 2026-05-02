import { TestBed } from '@angular/core/testing';
import { HttpClient, HTTP_INTERCEPTORS, provideHttpClient, withInterceptors, HttpEvent, HttpRequest, HttpHandler, HttpInterceptorFn, HttpHandlerFn, HttpErrorResponse } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { authInterceptor } from './auth.interceptor';
import { AuthService } from './auth.service';
import { Router } from '@angular/router';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('authInterceptor', () => {
  let httpMock: HttpTestingController;
  let httpClient: HttpClient;
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      getAccessToken: vi.fn(),
      refresh: vi.fn(),
      logout: vi.fn()
    };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        provideHttpClient(withInterceptors([authInterceptor])),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });

    httpClient = TestBed.inject(HttpClient);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should add Authorization header if token exists', () => {
    authServiceMock.getAccessToken.mockReturnValue('valid-token');
    httpClient.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(true);
    expect(req.request.headers.get('Authorization')).toBe('Bearer valid-token');
  });

  it('should not add Authorization header if token missing', () => {
    authServiceMock.getAccessToken.mockReturnValue(null);
    httpClient.get('/api/test').subscribe();
    const req = httpMock.expectOne('/api/test');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  it('should bypass interceptor for login and register', () => {
    httpClient.get('/api/auth/login').subscribe();
    const req = httpMock.expectOne('/api/auth/login');
    expect(req.request.headers.has('Authorization')).toBe(false);
  });

  // --- 401 RETRY LOGIC ---
  it('should retry request on 401 error with fresh token', () => {
    authServiceMock.getAccessToken.mockReturnValue('old-token');
    authServiceMock.refresh.mockReturnValue(of({ accessToken: 'new-token' }));

    httpClient.get('/api/secure').subscribe(res => {
      expect(res).toEqual({ data: 'ok' });
    });

    // First attempt fails with 401
    const req1 = httpMock.expectOne('/api/secure');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    // Second attempt succeeds
    const req2 = httpMock.expectOne('/api/secure');
    expect(req2.request.headers.get('Authorization')).toBe('Bearer new-token');
    req2.flush({ data: 'ok' });
  });

  it('should logout and navigate to login if refresh fails with 401', () => {
    authServiceMock.getAccessToken.mockReturnValue('old-token');
    authServiceMock.refresh.mockReturnValue(throwError(() => ({ status: 401 })));

    httpClient.get('/api/secure').subscribe({
      error: (err) => expect(err.status).toBe(401)
    });

    const req1 = httpMock.expectOne('/api/secure');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    expect(authServiceMock.logout).toHaveBeenCalled();
  });

  it('should not retry if error is not 401', () => {
    httpClient.get('/api/secure').subscribe({
      error: (err) => expect(err.status).toBe(500)
    });

    const req = httpMock.expectOne('/api/secure');
    req.flush('Server Error', { status: 500, statusText: 'Error' });
    
    expect(authServiceMock.refresh).not.toHaveBeenCalled();
  });

  // --- MULTIPLE 401s ---
  it('should not retry indefinitely (one retry max)', () => {
    authServiceMock.getAccessToken.mockReturnValue('token');
    authServiceMock.refresh.mockReturnValue(of({ accessToken: 'new-token' }));

    httpClient.get('/api/secure').subscribe({
      error: (err) => expect(err.status).toBe(401)
    });

    const req1 = httpMock.expectOne('/api/secure');
    req1.flush('Unauthorized', { status: 401, statusText: 'Unauthorized' });

    const req2 = httpMock.expectOne('/api/secure');
    req2.flush('Still Unauthorized', { status: 401, statusText: 'Unauthorized' });
    
    // No third request
    httpMock.expectNone('/api/secure');
  });
});
