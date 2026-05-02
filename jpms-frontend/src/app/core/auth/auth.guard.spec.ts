import { TestBed } from '@angular/core/testing';
import { Router, ActivatedRouteSnapshot } from '@angular/router';
import { authGuard } from './auth.guard';
import { AuthService } from './auth.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('authGuard', () => {
  let authServiceMock: any;
  let routerMock: any;

  beforeEach(() => {
    authServiceMock = {
      isLoggedIn: signal(false),
      currentRole: signal(null),
      logout: vi.fn(),
      navigateToDashboard: vi.fn()
    };
    routerMock = { navigate: vi.fn() };

    TestBed.configureTestingModule({
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock }
      ]
    });
  });

  const runGuard = (data: any = {}) => {
    const route = { data, url: [] } as any as ActivatedRouteSnapshot;
    return TestBed.runInInjectionContext(() => authGuard(route, {} as any));
  };

  it('should redirect to login if not logged in', () => {
    authServiceMock.isLoggedIn.set(false);
    expect(runGuard()).toBe(false);
    expect(routerMock.navigate).toHaveBeenCalledWith(['/login']);
  });

  it('should allow if logged in and no role required', () => {
    authServiceMock.isLoggedIn.set(true);
    expect(runGuard()).toBe(true);
  });

  it('should allow if role matches', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set('ADMIN');
    expect(runGuard({ role: 'ADMIN' })).toBe(true);
  });

  it('should redirect to dashboard if role mismatch', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set('RECRUITER');
    expect(runGuard({ role: 'ADMIN' })).toBe(false);
    expect(authServiceMock.navigateToDashboard).toHaveBeenCalled();
  });

  it('should logout and redirect if no role found', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set(null);
    expect(runGuard({ role: 'ADMIN' })).toBe(false);
    expect(authServiceMock.logout).toHaveBeenCalled();
  });
});
