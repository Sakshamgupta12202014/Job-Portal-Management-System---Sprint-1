import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { LoginComponent } from './login.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('LoginComponent', () => {
  let component: LoginComponent;
  let fixture: ComponentFixture<LoginComponent>;
  let authServiceMock: any;
  let toastServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      login: vi.fn().mockReturnValue(of({})),
      navigateToDashboard: vi.fn()
    };
    toastServiceMock = { success: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [LoginComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: routerMock },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(LoginComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should validate form and show errors (hasError branches)', () => {
    expect(component.hasError('nonExistent')).toBe(false);
    expect(component.hasError('email')).toBe(false);
    component.form.get('email')?.setValue('invalid-email');
    expect(component.hasError('email')).toBe(false);
    component.form.get('email')?.markAsTouched();
    expect(component.hasError('email')).toBe(true);
    component.form.get('email')?.setValue('test@test.com');
    expect(component.hasError('email')).toBe(false);
  });

  it('should handle login success', () => {
    component.form.patchValue({ email: 'a@a.com', password: 'password' });
    component.submit();
    expect(authServiceMock.login).toHaveBeenCalled();
    expect(authServiceMock.navigateToDashboard).toHaveBeenCalled();
  });

  it('should handle login error with message fallback branches', () => {
    authServiceMock.login.mockReturnValue(throwError(() => ({ error: { message: 'Banned' } })));
    component.form.patchValue({ email: 'a@a.com', password: 'password' });
    component.submit();
    expect(component.errorMsg()).toBe('Banned');

    authServiceMock.login.mockReturnValue(throwError(() => ({ error: {} })));
    component.submit();
    expect(component.errorMsg()).toBe('Invalid email or password.');

    authServiceMock.login.mockReturnValue(throwError(() => null));
    component.submit();
    expect(component.errorMsg()).toBe('Invalid email or password.');
  });

  it('should mark all as touched on invalid submit', () => {
    component.submit();
    expect(component.form.touched).toBe(true);
  });

  it('should render loading state in template', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Signing in...');
  });
});
