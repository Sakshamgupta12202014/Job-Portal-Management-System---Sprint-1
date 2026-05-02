import { ComponentFixture, TestBed, fakeAsync, tick } from '@angular/core/testing';
import { of, throwError } from 'rxjs';
import { AdminJobsComponent } from './admin-jobs.component';
import { AdminService } from '../../../core/services/admin.service';
import { ToastService } from '../../../core/services/toast.service';
import { ModalService } from '../../../core/services/modal.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { provideHttpClient } from '@angular/common/http';
import { provideHttpClientTesting } from '@angular/common/http/testing';

describe('AdminJobsComponent', () => {
  let component: AdminJobsComponent;
  let fixture: ComponentFixture<AdminJobsComponent>;
  let adminServiceMock: any;
  let toastServiceMock: any;
  let modalServiceMock: any;

  beforeEach(async () => {
    adminServiceMock = {
      getAllJobsPaged: vi.fn().mockReturnValue(of({ content: [], totalPages: 0, totalElements: 0, isLast: true })),
      deleteJob: vi.fn().mockReturnValue(of({ message: 'Deleted' }))
    };
    toastServiceMock = {
      success: vi.fn(),
      error: vi.fn()
    };
    modalServiceMock = {
      confirm: vi.fn().mockResolvedValue(true)
    };

    await TestBed.configureTestingModule({
      imports: [AdminJobsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        { provide: AdminService, useValue: adminServiceMock },
        { provide: ToastService, useValue: toastServiceMock },
        { provide: ModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(AdminJobsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and show skeleton loader', () => {
    component.loading.set(true);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('.animate-pulse')).toBeTruthy();
  });

  it('should show empty state without search query', () => {
    component.loading.set(false);
    component.jobs.set([]);
    component.searchQuery.set('');
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No Jobs Found');
  });

  it('should show empty state with search query', () => {
    component.loading.set(false);
    component.jobs.set([]);
    component.searchQuery.set('NonExistent');
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.textContent).toContain('No Matching Jobs');
    
    const clearButton = compiled.querySelector('button');
    clearButton.click();
    expect(component.searchQuery()).toBe('');
  });

  it('should render jobs table', () => {
    component.loading.set(false);
    component.jobs.set([
      { id: 1, title: 'Engineer', companyName: 'Tech', status: 'ACTIVE', createdAt: new Date().toISOString(), location: 'Remote', jobType: 'Full-time', postedBy: 101 },
      { id: 2, title: 'Designer', companyName: 'Creative', status: 'DELETED', createdAt: new Date().toISOString(), location: 'NY', jobType: 'Contract', postedBy: 102 }
    ]);
    fixture.detectChanges();
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('table')).toBeTruthy();
    expect(compiled.textContent).toContain('Engineer');
    expect(compiled.textContent).toContain('Deleted');
  });

  it('should handle search input', () => {
    const input = fixture.nativeElement.querySelector('input');
    input.value = 'Java';
    input.dispatchEvent(new Event('input'));
    expect(component.searchQuery()).toBe('Java');
  });

  it('should handle load error', () => {
    adminServiceMock.getAllJobsPaged.mockReturnValue(throwError(() => new Error('API Error')));
    component.loadJobs();
    expect(component.loading()).toBe(false);
  });

  it('should change page', () => {
    component.setPage(1);
    expect(component.currentPage()).toBe(1);
    expect(adminServiceMock.getAllJobsPaged).toHaveBeenCalled();
  });

  it('should delete job on confirmation', async () => {
    const job = { id: 1, title: 'Job', status: 'ACTIVE' } as any;
    modalServiceMock.confirm.mockResolvedValue(true);
    await component.deleteJob(job);
    expect(adminServiceMock.deleteJob).toHaveBeenCalledWith(1);
    expect(toastServiceMock.success).toHaveBeenCalled();
  });

  it('should not delete if cancelled', async () => {
    const job = { id: 1, title: 'Job', status: 'ACTIVE' } as any;
    modalServiceMock.confirm.mockResolvedValue(false);
    await component.deleteJob(job);
    expect(adminServiceMock.deleteJob).not.toHaveBeenCalled();
  });

  it('should handle delete error', async () => {
    const job = { id: 1, title: 'Job', status: 'ACTIVE' } as any;
    modalServiceMock.confirm.mockResolvedValue(true);
    adminServiceMock.deleteJob.mockReturnValue(throwError(() => new Error('Delete Error')));
    await component.deleteJob(job);
    expect(toastServiceMock.error).toHaveBeenCalled();
  });
});
