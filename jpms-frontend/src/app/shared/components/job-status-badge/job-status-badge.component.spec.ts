import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobStatusBadgeComponent } from './job-status-badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('JobStatusBadgeComponent', () => {
  let component: JobStatusBadgeComponent;
  let fixture: ComponentFixture<JobStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobStatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should apply correct classes for ACTIVE status', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-shortlisted');
  });

  it('should fallback for CLOSED status (not in config)', () => {
    fixture.componentRef.setInput('status', 'CLOSED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('bg-gray-100');
  });

  it('should apply correct classes for DELETED status', () => {
    fixture.componentRef.setInput('status', 'DELETED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('bg-red-100');
  });

  it('should fallback for unknown status', () => {
    fixture.componentRef.setInput('status', 'UNKNOWN');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('bg-gray-100');
  });
});
