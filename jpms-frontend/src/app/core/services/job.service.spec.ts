import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { JobService } from './job.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach } from 'vitest';

describe('JobService', () => {
  let service: JobService;
  let httpMock: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [JobService]
    });
    service = TestBed.inject(JobService);
    httpMock = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should create job with validation (postJob alias)', () => {
    const payload = { title: 'Senior Dev', salary: 100000, jobType: 'FULL_TIME' };
    service.postJob(payload as any).subscribe();
    
    const req = httpMock.expectOne(`${environment.apiUrl}/api/jobs`);
    expect(req.request.method).toBe('POST');
    req.flush({ id: 1 });

    expect(() => service.createJob({ title: 'X', salary: -1, jobType: '' } as any)).toThrow();
  });

  it('should get jobs with enrichment (searchJobs alias)', () => {
    const mockRes = {
      content: [
        { id: 1, title: 'Dev', salary: 50000 },
        { id: 2, title: 'Staff', salary: 120000 }
      ],
      currentPage: 0, totalPages: 1, totalElements: 2, isLast: true
    };

    service.searchJobs({ title: 'Dev' }).subscribe(res => {
      expect(res.content[0].title).toBe('Dev');
      expect(res.content[1].title).toContain('🔥');
    });

    const req = httpMock.expectOne(r => r.url.includes('/api/jobs') && r.params.get('title') === 'Dev');
    req.flush(mockRes);
  });

  it('should get all jobs paged', () => {
    service.getAllJobs(1, 20).subscribe();
    const req = httpMock.expectOne(r => 
      r.url.includes('/api/jobs') && 
      r.params.get('page') === '1' && 
      r.params.get('size') === '20'
    );
    req.flush({ content: [] });
  });

  it('should build complex search params', () => {
    service.getJobs({ title: '  a  ', location: '  b  ', experienceYears: 5 }).subscribe();
    const req = httpMock.expectOne(r => 
      r.params.get('title') === 'a' && 
      r.params.get('location') === 'b' &&
      r.params.get('experienceYears') === '5'
    );
    req.flush({ content: [] });
  });

  it('should get job by id with validation', () => {
    service.getJobById(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/jobs/1`);
    req.flush({});

    service.getJobById(0).subscribe({
      error: (err) => expect(err.message).toBe('Invalid Job ID')
    });
  });

  it('should get my jobs with pagination', () => {
    service.getMyJobs(0, 10).subscribe();
    const req = httpMock.expectOne(r => 
      r.url.includes('/api/jobs/recruiter/my') && 
      r.params.get('page') === '0' && 
      r.params.get('size') === '10'
    );
    req.flush([]);
  });

  it('should update job', () => {
    service.updateJob(1, { title: 'New Title', salary: 10, jobType: 'T' } as any).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/jobs/1`);
    expect(req.request.method).toBe('PUT');
    req.flush({});
  });

  it('should delete job', () => {
    service.deleteJob(1).subscribe();
    const req = httpMock.expectOne(`${environment.apiUrl}/api/jobs/1`);
    expect(req.request.method).toBe('DELETE');
    req.flush({});
  });
});
