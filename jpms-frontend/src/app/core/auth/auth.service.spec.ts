import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { AuthService } from './auth.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AuthService', () => {
  let service: AuthService;
  let httpMock: HttpTestingController;
  let routerMock: any;
  const api = `${environment.apiUrl}/api/auth`;

  const setupTest = (initialAuth: any = null) => {
    localStorage.clear();
    if (initialAuth) {
      localStorage.setItem('jpms_auth', JSON.stringify(initialAuth));
    }

    routerMock = { navigate: vi.fn() };
    
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [
        AuthService,
        { provide: Router, useValue: routerMock }
      ]
    });
    
    service = TestBed.inject(AuthService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
  };

  afterEach(() => {
    httpMock.verify();
    TestBed.resetTestingModule();
  });

  it('should validate login payload', () => {
    setupTest();
    expect(() => service.login({ email: '', password: '' })).toThrow('Credentials missing');
    expect(() => service.login({ email: 'a@b.com', password: '123' })).toThrow('Password too short');
  });

  it('should validate registration payload', () => {
    setupTest();
    expect(() => service.register({ email: 'invalid', password: '123', role: 'ADMIN', name: 'N', phone: '12' } as any)).toThrow('Invalid email');
    expect(() => service.register({ email: 'a@b.com', password: '123', role: 'INVALID', name: 'N', phone: '12' } as any)).toThrow('Invalid role');
  });

  it('should logout and handle server response', () => {
    setupTest({ accessToken: 'at', refreshToken: 'rt', role: 'ADMIN', userId: 1 });
    
    service.logout();
    const req = httpMock.expectOne(`${api}/logout`);
    expect(req.request.body).toEqual({ refreshToken: 'rt' });
    req.flush({});
    
    expect(service.isLoggedIn()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should handle refresh token success', () => {
    setupTest({ accessToken: 'at', refreshToken: 'rt', role: 'ADMIN', userId: 1 });
    
    service.refresh().subscribe(res => {
      expect(res.accessToken).toBe('at2');
    });
    const req = httpMock.expectOne(`${api}/refresh`);
    req.flush({ accessToken: 'at2', refreshToken: 'rt2', role: 'ADMIN', userId: 1 });
    expect(service.getAccessToken()).toBe('at2');
  });

  it('should handle profile management', () => {
    setupTest();
    service.getProfile().subscribe();
    httpMock.expectOne(`${api}/profile`).flush({ name: 'User' });

    expect(() => service.updateProfile({ phone: '123' })).toThrow('Phone number too short');
    service.updateProfile({ phone: '1234567890' }).subscribe();
    httpMock.expectOne(`${api}/profile`).flush({ phone: '1234567890' });
  });

  it('should handle file uploads and removals', () => {
    setupTest();
    const file = new File([''], 'test.png');
    
    service.uploadProfilePicture(file).subscribe();
    httpMock.expectOne(`${api}/profile/picture`).flush({});

    service.removeProfilePicture().subscribe();
    httpMock.expectOne(`${api}/profile/picture`).flush({});

    service.uploadResume(file).subscribe();
    httpMock.expectOne(`${api}/profile/resume`).flush({});

    service.removeResume().subscribe();
    httpMock.expectOne(`${api}/profile/resume`).flush({});
  });

  it('should navigate to correct dashboards', () => {
    const roles = ['ADMIN', 'RECRUITER', 'JOB_SEEKER'];
    roles.forEach(role => {
      setupTest({ role, accessToken: 'at' });
      service.navigateToDashboard();
      if (role === 'ADMIN') expect(routerMock.navigate).toHaveBeenCalledWith(['/admin/dashboard']);
      if (role === 'RECRUITER') expect(routerMock.navigate).toHaveBeenCalledWith(['/recruiter/dashboard']);
      if (role === 'JOB_SEEKER') expect(routerMock.navigate).toHaveBeenCalledWith(['/seeker/dashboard']);
      TestBed.resetTestingModule();
    });

    // Default case
    setupTest({ role: 'GUEST', accessToken: 'at' });
    service.navigateToDashboard();
    expect(routerMock.navigate).toHaveBeenCalledWith(['/']);
  });

  it('should handle storage errors gracefully', () => {
    localStorage.setItem('jpms_auth', '{ corrupt }');
    setupTest();
    expect(service.isLoggedIn()).toBe(false);
  });
});
