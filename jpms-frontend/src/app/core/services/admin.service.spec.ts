import { TestBed } from '@angular/core/testing';
import { HttpClientTestingModule, HttpTestingController } from '@angular/common/http/testing';
import { AdminService } from './admin.service';
import { environment } from '../../../environments/environment';
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

describe('AdminService', () => {
  let service: AdminService;
  let httpMock: HttpTestingController;
  const api = `${environment.apiUrl}/api/admin`;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule],
      providers: [AdminService]
    });
    service = TestBed.inject(AdminService);
    httpMock = TestBed.inject(HttpTestingController);
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    httpMock.verify();
  });

  it('should fetch users with pagination and search', () => {
    service.getAllUsersPaged(0, 10, '  BOB  ').subscribe(res => {
      expect(res.content[0].name).toBe('BOB');
      expect(res.content[1].name).toBe('Unknown User');
    });

    const req = httpMock.expectOne(r => r.url === `${api}/users/paged` && r.params.get('search') === 'bob');
    expect(req.request.method).toBe('GET');
    req.flush({
      content: [
        { id: 1, name: 'BOB', email: 'BOB@test.com' },
        { id: 2, name: '', email: 'ANON@test.com' }
      ],
      totalPages: 1,
      totalElements: 2
    });
  });

  it('should handle fetch users error', () => {
    service.getAllUsersPaged(0, 10).subscribe({
      error: (err) => expect(err.status).toBe(500)
    });
    const req = httpMock.expectOne(r => r.url === `${api}/users/paged`);
    req.flush('Error', { status: 500, statusText: 'Server Error' });
  });

  it('should fetch jobs and transform titles', () => {
    service.getAllJobsPaged(0, 10).subscribe(res => {
      expect(res.content[0].title).toBe('ENGINEER');
    });
    const req = httpMock.expectOne(r => r.url === `${api}/jobs/paged`);
    req.flush({ content: [{ id: 1, title: 'engineer' }] });
  });

  it('should get audit logs', () => {
    service.getAuditLogs().subscribe(logs => expect(logs.length).toBe(1));
    const req = httpMock.expectOne(`${api}/audit-logs`);
    req.flush([{ id: 1, action: 'TEST' }]);
  });

  it('should get public stats', () => {
    service.getPublicStats().subscribe();
    httpMock.expectOne(`${api}/public/stats`).flush({});
  });

  it('should get report and validate integrity (getReport alias)', () => {
    service.getReport().subscribe();
    const req = httpMock.expectOne(`${api}/reports`);
    req.flush({ totalUsers: 100, activeJobs: 50 });
  });

  it('should throw error on invalid report data', () => {
    service.getPlatformReport().subscribe({
      error: (err) => expect(err.message).toBe('Invalid report data received')
    });
    const req = httpMock.expectOne(`${api}/reports`);
    req.flush({ totalUsers: -1 });
  });

  it('should process market data for critical and steady states', () => {
    // Case 1: Critical
    service.getMarketPulse().subscribe(d => expect(d.marketDemandStatus).toBe('CRITICAL_HIGH'));
    httpMock.expectOne(`${api}/market-pulse`).flush({ avgSalary: 150000 });

    // Case 2: Steady
    service.getMarketPulse().subscribe(d => expect(d.marketDemandStatus).toBe('STEADY'));
    httpMock.expectOne(`${api}/market-pulse`).flush({ avgSalary: 60000 });
    
    // Case 3: Low (no change)
    service.getMarketPulse().subscribe(d => expect(d.marketDemandStatus).toBeUndefined());
    httpMock.expectOne(`${api}/market-pulse`).flush({ avgSalary: 1000 });
  });

  it('should validate ID on deletion', () => {
    service.deleteUser(-1).subscribe({ error: e => expect(e.message).toBe('Invalid user ID') });
    service.deleteJob(0).subscribe({ error: e => expect(e.message).toBe('Invalid job ID') });
  });

  it('should call ban/unban endpoints', () => {
    service.banUser(1).subscribe();
    httpMock.expectOne(`${api}/users/1/ban`).flush({ message: 'Banned' });

    service.unbanUser(1).subscribe();
    httpMock.expectOne(`${api}/users/1/unban`).flush({ message: 'Unbanned' });
  });
});
