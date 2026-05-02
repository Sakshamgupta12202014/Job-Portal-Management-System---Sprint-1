import { inject } from '@angular/core';
import { CanActivateFn, Router, ActivatedRouteSnapshot } from '@angular/router';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const authService = inject(AuthService);
  const router      = inject(Router);

  console.log('authGuard: Checking route', route.url.map(s => s.path).join('/'));

  if (!authService.isLoggedIn()) {
    console.log('authGuard: Not logged in, redirecting to login');
    router.navigate(['/login']);
    return false;
  }

  const role = authService.currentRole();
  const requiredRole: string | undefined = route.data['role'];

  console.log('authGuard: User role:', role, 'Required role:', requiredRole);

  if (requiredRole && role !== requiredRole) {
    if (!role) {
      console.warn('authGuard: User is logged in but has NO role. Redirecting to login.');
      authService.logout();
      return false;
    }
    console.log('authGuard: Role mismatch, redirecting to appropriate dashboard');
    authService.navigateToDashboard();
    return false;
  }

  return true;
};
