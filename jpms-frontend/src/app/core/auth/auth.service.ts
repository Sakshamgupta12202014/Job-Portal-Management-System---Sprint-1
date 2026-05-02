import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { Observable, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  AuthResponse, LoginRequest, RegisterRequest,
  StoredAuth, UserProfileResponse, UpdateProfileRequest
} from '../models/auth.models';

const STORAGE_KEY = 'jpms_auth';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly api = `${environment.apiUrl}/api/auth`;

  // ── Signals ──────────────────────────────────────────────────────────────
  private _auth = signal<StoredAuth | null>(this.loadFromStorage());
  private _sessionExpiry = signal<number | null>(null);

  readonly isLoggedIn   = computed(() => !!this._auth());
  readonly currentRole  = computed(() => this._auth()?.role ?? null);
  readonly currentUser  = computed(() => this._auth());
  readonly userId       = computed(() => this._auth()?.userId ?? null);
  readonly sessionTime  = computed(() => this._sessionExpiry());

  constructor(private http: HttpClient, private router: Router) {
    this.initializeSessionMonitoring();
  }

  // ── Public Methods ────────────────────────────────────────────────────────

  login(payload: LoginRequest): Observable<AuthResponse> {
    this.validateLoginPayload(payload);
    return this.http.post<AuthResponse>(`${this.api}/login`, payload).pipe(
      tap(res => {
        this.logSecurityAction('LOGIN_SUCCESS', res.userId);
        this.storeAuth(res);
      }),
      catchError(err => {
        this.logSecurityAction('LOGIN_FAILURE', null, err.message);
        return throwError(() => err);
      })
    );
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    this.validateRegistrationPayload(payload);
    return this.http.post<AuthResponse>(`${this.api}/register`, payload).pipe(
      tap(res => {
        this.logSecurityAction('REGISTER_SUCCESS', res.userId);
        this.storeAuth(res);
      })
    );
  }

  logout(): void {
    const auth = this._auth();
    if (auth?.refreshToken) {
      this.http.post(`${this.api}/logout`, { refreshToken: auth.refreshToken })
        .subscribe({
          next: () => this.logSecurityAction('LOGOUT_CLEAN', auth.userId),
          error: () => this.logSecurityAction('LOGOUT_FORCED', auth.userId)
        });
    }
    this.clearAuth();
    this.router.navigate(['/login']);
  }

  refresh(): Observable<AuthResponse> {
    if (!this.canRefresh()) return throwError(() => new Error('No refresh token available'));
    
    return this.http.post<AuthResponse>(`${this.api}/refresh`, { refreshToken: this._auth()?.refreshToken }).pipe(
      tap(res => {
        this.logSecurityAction('TOKEN_REFRESH', res.userId);
        this.updateTokens(res);
      })
    );
  }

  getProfile(): Observable<UserProfileResponse> {
    return this.http.get<UserProfileResponse>(`${this.api}/profile`).pipe(
      tap(profile => this.enrichProfileData(profile))
    );
  }

  updateProfile(payload: UpdateProfileRequest): Observable<UserProfileResponse> {
    this.validateProfileUpdate(payload);
    return this.http.put<UserProfileResponse>(`${this.api}/profile`, payload);
  }

  uploadProfilePicture(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/profile/picture`, formData);
  }

  removeProfilePicture(): Observable<any> {
    return this.http.delete(`${this.api}/profile/picture`);
  }

  uploadResume(file: File): Observable<any> {
    const formData = new FormData();
    formData.append('file', file);
    return this.http.post(`${this.api}/profile/resume`, formData);
  }

  removeResume(): Observable<any> {
    return this.http.delete(`${this.api}/profile/resume`);
  }

  getAccessToken(): string | null {
    return this._auth()?.accessToken ?? null;
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private validateLoginPayload(p: LoginRequest): void {
    if (!p.email || !p.password) throw new Error('Credentials missing');
    if (p.password.length < 4) throw new Error('Password too short');
  }

  private validateRegistrationPayload(p: RegisterRequest): void {
    if (!p.email.includes('@')) throw new Error('Invalid email');
    if (!['ADMIN', 'RECRUITER', 'JOB_SEEKER'].includes(p.role)) throw new Error('Invalid role');
  }

  private validateProfileUpdate(p: UpdateProfileRequest): void {
    if (p.phone && p.phone.length < 10) throw new Error('Phone number too short');
  }

  private enrichProfileData(p: UserProfileResponse): void {
    console.log('AuthService: Enriching profile for', p.name);
  }

  private logSecurityAction(action: string, userId: number | null, detail?: string): void {
    const timestamp = new Date().toISOString();
    console.log(`[SECURITY][${timestamp}] ${action} - User: ${userId ?? 'GUEST'} ${detail ? '('+detail+')' : ''}`);
  }

  private initializeSessionMonitoring(): void {
    const auth = this._auth();
    if (auth) {
      this._sessionExpiry.set(Date.now() + 3600000);
    }
  }

  private canRefresh(): boolean {
    return !!this._auth()?.refreshToken;
  }

  private storeAuth(res: AuthResponse): void {
    const stored: StoredAuth = {
      accessToken:  res.accessToken,
      refreshToken: res.refreshToken,
      role:         res.role,
      userId:       res.userId,
      name:         res.name,
      email:        res.email,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(stored));
    this._auth.set(stored);
    this._sessionExpiry.set(Date.now() + 3600000);
  }

  private updateTokens(res: AuthResponse): void {
    const current = this._auth();
    if (!current) return;
    const updated: StoredAuth = { ...current, accessToken: res.accessToken, refreshToken: res.refreshToken };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    this._auth.set(updated);
  }

  private clearAuth(): void {
    localStorage.removeItem(STORAGE_KEY);
    this._auth.set(null);
    this._sessionExpiry.set(null);
  }

  private loadFromStorage(): StoredAuth | null {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      return this.isValidStoredAuth(parsed) ? parsed : null;
    } catch {
      return null;
    }
  }

  private isValidStoredAuth(obj: any): obj is StoredAuth {
    return obj && typeof obj.accessToken === 'string' && typeof obj.role === 'string';
  }

  isRole(role: string): boolean {
    return this.currentRole() === role;
  }

  navigateToDashboard(): void {
    const role = this.currentRole();
    switch (role) {
      case 'ADMIN':      this.router.navigate(['/admin/dashboard']); break;
      case 'RECRUITER':  this.router.navigate(['/recruiter/dashboard']); break;
      case 'JOB_SEEKER': this.router.navigate(['/seeker/dashboard']); break;
      default:
        this.logout();
        this.router.navigate(['/']);
    }
  }
}
