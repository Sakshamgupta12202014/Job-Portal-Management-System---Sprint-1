import { ComponentFixture, TestBed } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { RegisterComponent } from './register.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { Router, ActivatedRoute } from '@angular/router';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('RegisterComponent', () => {
  let component: RegisterComponent;
  let fixture: ComponentFixture<RegisterComponent>;
  let authServiceMock: any;
  let toastServiceMock: any;
  let routerMock: any;

  beforeEach(async () => {
    authServiceMock = {
      register: vi.fn().mockReturnValue(of({})),
      navigateToDashboard: vi.fn()
    };
    toastServiceMock = { success: vi.fn() };
    routerMock = { navigate: vi.fn() };

    await TestBed.configureTestingModule({
      imports: [RegisterComponent],
      providers: [
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: Router, useValue: routerMock },
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AuthService, useValue: authServiceMock },
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(RegisterComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  it('should switch roles and update UI', () => {
    component.setRole('RECRUITER');
    expect(component.selectedRole()).toBe('RECRUITER');
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Recruiter');
  });

  it('should validate form and show errors (hasError branches)', () => {
    expect(component.hasError('nonExistent')).toBe(false);
    component.form.get('email')?.setValue('invalid');
    component.form.get('email')?.markAsTouched();
    expect(component.hasError('email')).toBe(true);
    component.form.get('email')?.setValue('test@test.com');
    expect(component.hasError('email')).toBe(false);
  });

  it('should handle registration success', () => {
    component.form.patchValue({ name: 'N', email: 'a@a.com', password: 'password123' });
    component.submit();
    expect(authServiceMock.register).toHaveBeenCalled();
    expect(authServiceMock.navigateToDashboard).toHaveBeenCalled();
  });

  it('should handle registration error with message fallback branches', () => {
    authServiceMock.register.mockReturnValue(throwError(() => ({ error: { message: 'Email taken' } })));
    component.form.patchValue({ name: 'N', email: 'a@a.com', password: 'password123' });
    component.submit();
    expect(component.errorMsg()).toBe('Email taken');

    authServiceMock.register.mockReturnValue(throwError(() => ({})));
    component.submit();
    expect(component.errorMsg()).toBe('Registration failed. Please try again.');
  });

  it('should mark all as touched on invalid submit', () => {
    component.submit();
    expect(component.form.touched).toBe(true);
  });

  it('should render loading state in template', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Creating Account...');
  });
});
