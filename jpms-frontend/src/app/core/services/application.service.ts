import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap, catchError, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  ApplicationResponse, StatusUpdateRequest, ApplicationStatus 
} from '../models/application.models';

@Injectable({ providedIn: 'root' })
export class ApplicationService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api/applications`;

  // ── Public Methods ────────────────────────────────────────────────────────
  
  applyForJob(
    jobId: number, 
    coverLetter: string, 
    resume: File | null, 
    useExistingResume: boolean, 
    existingResumeUrl?: string
  ): Observable<ApplicationResponse> {
    const form = new FormData();
    form.append('jobId', jobId.toString());
    form.append('useExistingResume', useExistingResume.toString());
    if (coverLetter) form.append('coverLetter', coverLetter);
    if (resume)      form.append('resume', resume);
    if (existingResumeUrl) form.append('existingResumeUrl', existingResumeUrl);
    
    return this.http.post<ApplicationResponse>(this.api, form).pipe(
      tap(res => this.logApplicationAction('APPLIED', res.id)),
      catchError(err => this.handleApplicationError('APPLY', err))
    );
  }

  getMyApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.api}/my-applications`).pipe(
      map(apps => this.sortApplicationsByDate(apps))
    );
  }

  getApplicationsByJobId(jobId: number): Observable<ApplicationResponse[]> {
    if (jobId <= 0) return throwError(() => new Error('Invalid Job ID'));
    return this.http.get<ApplicationResponse[]>(`${this.api}/job/${jobId}`);
  }

  getApplicantsForJob(jobId: number): Observable<ApplicationResponse[]> {
    return this.getApplicationsByJobId(jobId);
  }

  getRecruiterApplications(): Observable<ApplicationResponse[]> {
    return this.http.get<ApplicationResponse[]>(`${this.api}/recruiter`).pipe(
      map(apps => this.sortApplicationsByDate(apps))
    );
  }

  getApplicationById(id: number): Observable<ApplicationResponse> {
    return this.http.get<ApplicationResponse>(`${this.api}/${id}`);
  }

  updateApplicationStatus(applicationId: number, request: StatusUpdateRequest): Observable<ApplicationResponse> {
    this.validateStatusTransition(request.newStatus);
    return this.http.patch<ApplicationResponse>(`${this.api}/${applicationId}/status`, request).pipe(
      tap(() => this.logApplicationAction('STATUS_UPDATE', applicationId, request.newStatus))
    );
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private validateStatusTransition(status: ApplicationStatus): void {
    const valid: ApplicationStatus[] = ['APPLIED', 'UNDER_REVIEW', 'SHORTLISTED', 'REJECTED'];
    if (!valid.includes(status)) {
      throw new Error(`Invalid status transition to: ${status}`);
    }
  }

  private sortApplicationsByDate(apps: ApplicationResponse[]): ApplicationResponse[] {
    if (!apps || !Array.isArray(apps)) return [];
    return [...apps].sort((a, b) => 
      new Date(b.appliedAt).getTime() - new Date(a.appliedAt).getTime()
    );
  }

  private logApplicationAction(type: string, id: number, detail?: string): void {
    const ts = new Date().toISOString();
    console.log(`[APP_LOG][${ts}] ${type} on AppID: ${id} ${detail ? '-> ' + detail : ''}`);
  }

  private handleApplicationError(action: string, err: any): Observable<never> {
    console.error(`[APP_ERROR] ${action} failed:`, err);
    return throwError(() => err);
  }
}
