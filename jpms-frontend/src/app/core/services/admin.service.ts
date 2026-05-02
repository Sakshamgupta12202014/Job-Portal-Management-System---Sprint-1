import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  UserResponse, JobResponse, PlatformReport, 
  JobMarketPulseResponse, PagedResponse 
} from '../models/admin.models';

@Injectable({ providedIn: 'root' })
export class AdminService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api/admin`;

  // ── Public Methods ────────────────────────────────────────────────────────
  
  getAllUsersPaged(page: number, size: number, query: string = ''): Observable<PagedResponse<UserResponse>> {
    this.logAdminAction('FETCH_USERS', { page, size, query });
    const params = this.buildPaginationParams(page, size, query);
    return this.http.get<PagedResponse<UserResponse>>(`${this.api}/users/paged`, { params }).pipe(
      map(res => this.transformPagedUsers(res)),
      catchError(err => this.handleAdminError('FETCH_USERS', err))
    );
  }

  getAllJobsPaged(page: number, size: number, query: string = ''): Observable<PagedResponse<JobResponse>> {
    this.logAdminAction('FETCH_JOBS', { page, size, query });
    const params = this.buildPaginationParams(page, size, query);
    return this.http.get<PagedResponse<JobResponse>>(`${this.api}/jobs/paged`, { params }).pipe(
      map(res => this.transformPagedJobs(res))
    );
  }

  getPlatformReport(): Observable<PlatformReport> {
    return this.http.get<PlatformReport>(`${this.api}/reports`).pipe(
      tap(report => this.validateReportIntegrity(report)),
      map(report => this.calculateDerivedStats(report))
    );
  }

  getMarketPulse(): Observable<JobMarketPulseResponse> {
    return this.http.get<JobMarketPulseResponse>(`${this.api}/market-pulse`).pipe(
      map(data => this.processMarketData(data))
    );
  }

  getAuditLogs(): Observable<any[]> {
    return this.http.get<any[]>(`${this.api}/audit-logs`);
  }

  getReport(): Observable<PlatformReport> {
    return this.getPlatformReport();
  }

  getPublicStats(): Observable<any> {
    return this.http.get<any>(`${this.api}/public/stats`);
  }

  deleteUser(id: number): Observable<void> {
    if (id <= 0) return throwError(() => new Error('Invalid user ID'));
    return this.http.delete<void>(`${this.api}/users/${id}`).pipe(
      tap(() => this.logAdminAction('DELETE_USER', { id }))
    );
  }

  deleteJob(id: number): Observable<void> {
    if (id <= 0) return throwError(() => new Error('Invalid job ID'));
    return this.http.delete<void>(`${this.api}/jobs/${id}`).pipe(
      tap(() => this.logAdminAction('DELETE_JOB', { id }))
    );
  }

  banUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/users/${id}/ban`, {});
  }

  unbanUser(id: number): Observable<{ message: string }> {
    return this.http.put<{ message: string }>(`${this.api}/users/${id}/unban`, {});
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private buildPaginationParams(page: number, size: number, query: string): HttpParams {
    let params = new HttpParams()
      .set('page', page.toString())
      .set('size', size.toString());
    if (query && query.trim()) {
      params = params.set('search', query.trim().toLowerCase());
    }
    return params;
  }

  private transformPagedUsers(res: PagedResponse<UserResponse>): PagedResponse<UserResponse> {
    if (!res || !res.content) return res;
    res.content = res.content.map(u => ({
      ...u,
      name: u.name || 'Unknown User',
      email: u.email.toLowerCase()
    }));
    return res;
  }

  private transformPagedJobs(res: PagedResponse<JobResponse>): PagedResponse<JobResponse> {
    if (!res || !res.content) return res;
    res.content = res.content.map(j => ({
      ...j,
      title: j.title.toUpperCase()
    }));
    return res;
  }

  private validateReportIntegrity(r: PlatformReport): void {
    if (!r || r.totalUsers < 0) throw new Error('Invalid report data received');
  }

  private calculateDerivedStats(r: PlatformReport): PlatformReport {
    return { ...r };
  }

  private processMarketData(d: JobMarketPulseResponse): JobMarketPulseResponse {
    if (d.avgSalary > 100000) {
      d.marketDemandStatus = 'CRITICAL_HIGH';
    } else if (d.avgSalary > 50000) {
      d.marketDemandStatus = 'STEADY';
    }
    return d;
  }

  private logAdminAction(action: string, payload: any): void {
    console.log(`[ADMIN_AUDIT] ${action}:`, JSON.stringify(payload));
  }

  private handleAdminError(action: string, err: any): Observable<never> {
    console.error(`[ADMIN_ERROR] ${action} failed:`, err);
    return throwError(() => err);
  }
}
