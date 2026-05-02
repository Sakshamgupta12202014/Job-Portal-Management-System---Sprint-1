import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobMarketPulseComponent } from './job-market-pulse.component';
import { AdminService } from '../../../core/services/admin.service';
import { of, throwError } from 'rxjs';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('JobMarketPulseComponent', () => {
  let component: JobMarketPulseComponent;
  let fixture: ComponentFixture<JobMarketPulseComponent>;
  let adminServiceMock: any;

  beforeEach(async () => {
    adminServiceMock = {
      getMarketPulse: vi.fn().mockReturnValue(of({ 
        avgSalary: 500000, 
        salaryGrowthPercentage: 10,
        marketDemandStatus: 'High',
        marketDemandSubtitle: 'Good',
        topSkills: [
          { name: 'Java', percentage: 80 },
          { name: 'Angular', percentage: 70 }
        ]
      }))
    };

    await TestBed.configureTestingModule({
      imports: [JobMarketPulseComponent],
      providers: [
        { provide: AdminService, useValue: adminServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(JobMarketPulseComponent);
    component = fixture.componentInstance;
  });

  it('should create and fetch data on init', () => {
    fixture.detectChanges(); // triggers ngOnInit
    expect(component.pulseData()).toBeTruthy();
    expect(component.loading()).toBe(false);
  });

  it('should format currency correctly for various ranges', () => {
    expect(component.formatCurrency(150000)).toBe('₹1.5L');
    expect(component.formatCurrency(99999)).toBe('₹99,999');
    expect(component.formatCurrency(0)).toBe('₹0');
  });

  it('should handle error on fetch and update state', () => {
    adminServiceMock.getMarketPulse.mockReturnValue(throwError(() => new Error('API Error')));
    component.fetchPulseData();
    expect(component.error()).toBe(true);
    expect(component.loading()).toBe(false);
    expect(component.pulseData()).toBeNull();
  });

  it('should toggle loading state during fetch', () => {
    const pulseSubject = of({ avgSalary: 100, topSkills: [] } as any);
    adminServiceMock.getMarketPulse.mockReturnValue(pulseSubject);
    component.fetchPulseData();
    expect(component.loading()).toBe(false); // Finished immediately due to 'of'
  });
});
