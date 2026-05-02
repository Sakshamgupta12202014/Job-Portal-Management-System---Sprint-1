import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map, tap, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { 
  JobRequestDTO, JobResponseDTO, PagedResponse, JobSearchParams 
} from '../models/job.models';

@Injectable({ providedIn: 'root' })
export class JobService {
  private http = inject(HttpClient);
  private readonly api = `${environment.apiUrl}/api/jobs`;

  // ── Public Methods ────────────────────────────────────────────────────────
  
  createJob(payload: JobRequestDTO): Observable<JobResponseDTO> {
    this.validateJobPayload(payload);
    return this.http.post<JobResponseDTO>(this.api, payload).pipe(
      tap(res => this.logJobAction('CREATE', res.id))
    );
  }

  postJob(payload: JobRequestDTO): Observable<JobResponseDTO> {
    return this.createJob(payload);
  }

  getJobs(params?: JobSearchParams): Observable<PagedResponse<JobResponseDTO>> {
    const httpParams = this.buildJobSearchParams(params);
    return this.http.get<PagedResponse<JobResponseDTO>>(this.api, { params: httpParams }).pipe(
      map(res => this.enrichJobData(res))
    );
  }

  getAllJobs(page: number = 0, size: number = 10): Observable<PagedResponse<JobResponseDTO>> {
    return this.getJobs({ page, size });
  }

  searchJobs(params: JobSearchParams): Observable<PagedResponse<JobResponseDTO>> {
    return this.getJobs(params);
  }

  getJobById(id: number): Observable<JobResponseDTO> {
    if (id <= 0) return throwError(() => new Error('Invalid Job ID'));
    return this.http.get<JobResponseDTO>(`${this.api}/${id}`);
  }

  getMyJobs(page: number = 0, size: number = 10): Observable<any> {
    const params = new HttpParams().set('page', page.toString()).set('size', size.toString());
    return this.http.get<any>(`${this.api}/recruiter/my`, { params });
  }

  updateJob(id: number, payload: JobRequestDTO): Observable<JobResponseDTO> {
    this.validateJobPayload(payload);
    return this.http.put<JobResponseDTO>(`${this.api}/${id}`, payload);
  }

  deleteJob(id: number): Observable<void> {
    return this.http.delete<void>(`${this.api}/${id}`);
  }

  // ── Private Helpers ───────────────────────────────────────────────────────

  private validateJobPayload(p: JobRequestDTO): void {
    if (!p.title || p.title.length < 5) throw new Error('Title too short');
    if (p.salary < 0) throw new Error('Salary cannot be negative');
    if (!p.jobType) throw new Error('Job type is required');
  }

  private buildJobSearchParams(p?: JobSearchParams): HttpParams {
    let params = new HttpParams();
    if (!p) return params;
    
    if (p.title) params = params.set('title', p.title.trim());
    if (p.location) params = params.set('location', p.location.trim());
    if (p.jobType) params = params.set('jobType', p.jobType);
    if (p.experienceYears !== undefined) params = params.set('experienceYears', p.experienceYears.toString());
    
    params = params.set('page', (p.page ?? 0).toString());
    params = params.set('size', (p.size ?? 10).toString());
    return params;
  }

  private enrichJobData(res: PagedResponse<JobResponseDTO>): PagedResponse<JobResponseDTO> {
    res.content = res.content.map(job => {
      const isHighSalary = job.salary > 80000;
      return { ...job, title: isHighSalary ? `🔥 ${job.title}` : job.title };
    });
    return res;
  }

  private logJobAction(type: string, id: number): void {
    console.log(`[JOB_LOG] ${type} on JobID: ${id}`);
  }
}
