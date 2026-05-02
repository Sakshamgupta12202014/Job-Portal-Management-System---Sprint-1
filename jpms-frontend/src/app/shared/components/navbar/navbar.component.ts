import { Component, inject, computed, signal, effect } from '@angular/core';
import { Router, NavigationEnd, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { filter } from 'rxjs/operators';
import { ThemeToggleComponent } from '../theme-toggle/theme-toggle.component';
import { AuthService } from '../../../core/auth/auth.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, RouterLinkActive, ThemeToggleComponent],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent {
  private auth   = inject(AuthService);
  private router = inject(Router);
  private toast  = inject(ToastService);
  private modal  = inject(ModalService);

  isLoggedIn  = this.auth.isLoggedIn;
  currentRole = this.auth.currentRole;
  userName    = computed(() => this.auth.currentUser()?.name ?? '');
  userEmail   = computed(() => this.auth.currentUser()?.email ?? '');
  nameInitial = computed(() => (this.auth.currentUser()?.name ?? '?')[0].toUpperCase());

  isLandingPage = signal(false);
  
  homeLink    = computed(() => {
    if (!this.isLoggedIn()) return '/';
    const r = this.currentRole();
    if (r === 'ADMIN')     return '/admin/dashboard';
    if (r === 'RECRUITER') return '/recruiter/dashboard';
    return '/seeker/dashboard';
  });

  isMenuOpen  = signal(false);
  isMobileMenuOpen = signal(false);

  constructor() {
    this.router.events.pipe(
      filter(event => event instanceof NavigationEnd)
    ).subscribe((event: any) => {
      this.isLandingPage.set(event.url === '/' || event.url === '/#');
    });
    this.isLandingPage.set(this.router.url === '/' || this.router.url === '/#');
  }

  toggleMenu() { this.isMenuOpen.update((v: boolean) => !v); }
  closeMenu()  { this.isMenuOpen.set(false); }
  
  toggleMobileMenu() { this.isMobileMenuOpen.update((v: boolean) => !v); }
  closeMobileMenu() { this.isMobileMenuOpen.set(false); }

  isRole(role: string) { return this.currentRole() === role; }

  profileLink() {
    const r = this.currentRole();
    if (r === 'ADMIN')     return '/admin/dashboard';
    if (r === 'RECRUITER') return '/recruiter/profile';
    return '/seeker/profile';
  }

  async logout() { 
    this.closeMenu();
    this.closeMobileMenu();

    const confirmed = await this.modal.confirm({
      title: 'Logout?',
      message: 'Are you sure you want to end your current session? You will need to re-authenticate to access your dashboard.',
      confirmText: 'Logout Now',
      type: 'danger',
      icon: '🚪'
    });

    if (confirmed) {
      this.auth.logout();
      this.toast.success('Successfully logged out. See you soon!');
    }
  }

  refreshPage() {
    window.location.reload();
  }
}
