import { ComponentFixture, TestBed } from '@angular/core/testing';
import { NavbarComponent } from './navbar.component';
import { AuthService } from '../../../core/auth/auth.service';
import { Router, ActivatedRoute, NavigationEnd } from '@angular/router';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { Subject, of } from 'rxjs';
import { describe, it, expect, beforeEach, beforeAll, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';

describe('NavbarComponent', () => {
  let component: NavbarComponent;
  let fixture: ComponentFixture<NavbarComponent>;
  let authServiceMock: any;
  let routerMock: any;
  let toastServiceMock: any;
  let modalServiceMock: any;
  let routerEvents: Subject<any>;

  beforeAll(() => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    Object.defineProperty(window, 'location', {
      writable: true,
      value: { reload: vi.fn() }
    });
  });

  beforeEach(async () => {
    routerEvents = new Subject<any>();
    
    authServiceMock = {
      isLoggedIn: signal(false),
      currentRole: signal(null),
      currentUser: signal(null),
      logout: vi.fn()
    };

    routerMock = {
      events: routerEvents.asObservable(),
      url: '/',
      navigate: vi.fn()
    };

    toastServiceMock = { success: vi.fn() };
    modalServiceMock = { confirm: vi.fn().mockResolvedValue(true) };

    await TestBed.configureTestingModule({
      imports: [NavbarComponent],
      providers: [
        { provide: AuthService, useValue: authServiceMock },
        { provide: Router, useValue: routerMock },
        { provide: ActivatedRoute, useValue: { params: of({}) } },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(NavbarComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should render logged out links', () => {
    authServiceMock.isLoggedIn.set(false);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Login');
    expect(compiled.textContent).toContain('Register');
  });

  it('should render logged in user info (first name in nav, full name in dropdown)', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentUser.set({ name: 'Jane Doe', email: 'jane@test.com' });
    authServiceMock.currentRole.set('JOB_SEEKER');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    // Template uses userName().split(' ')[0] for the trigger
    expect(compiled.textContent).toContain('Jane');
    expect(compiled.textContent).toContain('Dashboard');

    // Open menu to see full name
    component.toggleMenu();
    fixture.detectChanges();
    expect(compiled.textContent).toContain('Jane Doe');
    expect(compiled.textContent).toContain('jane@test.com');
  });

  it('should logout successfully when confirmed', async () => {
    modalServiceMock.confirm.mockResolvedValue(true);
    await component.logout();
    expect(authServiceMock.logout).toHaveBeenCalled();
    expect(toastServiceMock.success).toHaveBeenCalled();
  });

  it('should handle mobile menu interaction and role visibility', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set('RECRUITER');
    component.toggleMobileMenu();
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Post Job');
    
    component.closeMobileMenu();
    fixture.detectChanges();
    expect(component.isMobileMenuOpen()).toBe(false);
  });

  it('should handle admin identity and quick logout', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set('ADMIN');
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('Administrator');
    expect(compiled.textContent).toContain('LOGOUT');
  });

  it('should reactive update home link and profile link', () => {
    authServiceMock.isLoggedIn.set(true);
    authServiceMock.currentRole.set('JOB_SEEKER');
    expect(component.homeLink()).toBe('/seeker/dashboard');
    expect(component.profileLink()).toBe('/seeker/profile');

    authServiceMock.currentRole.set('RECRUITER');
    expect(component.homeLink()).toBe('/recruiter/dashboard');
    expect(component.profileLink()).toBe('/recruiter/profile');
  });

  it('should detect navigation events for landing page check', () => {
    routerEvents.next(new NavigationEnd(1, '/jobs', '/jobs'));
    expect(component.isLandingPage()).toBe(false);
    
    routerEvents.next(new NavigationEnd(2, '/', '/'));
    expect(component.isLandingPage()).toBe(true);
  });

  it('should refresh page', () => {
    component.refreshPage();
    expect(window.location.reload).toHaveBeenCalled();
  });
});
