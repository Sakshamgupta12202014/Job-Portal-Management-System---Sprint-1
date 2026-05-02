import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { ApplicationService } from './application.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('ApplicationService', () => {
  let service: ApplicationService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [ApplicationService]
    });
    service = TestBed.inject(ApplicationService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should apply for job with correct parameters', () => {
    service.applyForJob(1, 'Cover letter', null, false).subscribe(res => {
      expect(res.id).toBe(101);
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/applications`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 101, status: 'APPLIED' });
  });

  it('should handle application errors', () => {
    service.applyForJob(1, 'Cover letter', null, false).subscribe({
      error: (err) => expect(err.status).toBe(400)
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/applications`);
    req.flush('Fail', { status: 400, statusText: 'Bad Request' });
  });

  it('should get recruiter applications', () => {
    service.getRecruiterApplications().subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/applications/recruiter`).flush([]);
  });

  it('should get applicants for job (alias)', () => {
    service.getApplicantsForJob(1).subscribe();
    httpMock.expectOne(`${environment.apiUrl}/api/applications/job/1`).flush([]);
  });

  it('should get my applications and sort them', () => {
    const mockApps: any[] = [
      { id: 1, appliedAt: '2023-01-01' },
      { id: 2, appliedAt: '2023-05-01' }
    ];

    service.getMyApplications().subscribe(apps => {
      expect(apps[0].id).toBe(2); // Sorted by date desc
    });

    const req = httpMock.expectOne(`${environment.apiUrl}/api/applications/my-applications`);
    req.flush(mockApps);
  });

  it('should get applications by job id', () => {
    service.getApplicationsByJobId(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/applications/job/1`);
    req.flush([]);

    service.getApplicationsByJobId(0).subscribe({
      error: (err) => expect(err.message).toBe('Invalid Job ID')
    });
  });

  it('should update application status with transition validation', () => {
    service.updateApplicationStatus(1, { newStatus: 'SHORTLISTED', recruiterNote: 'Good' }).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/applications/1/status`);
    expect(req.request.method).toBe('PATCH');
    req.flush({});

    expect(() => service.updateApplicationStatus(1, { newStatus: 'INVALID' as any, recruiterNote: '' })).toThrow();
  });
});
