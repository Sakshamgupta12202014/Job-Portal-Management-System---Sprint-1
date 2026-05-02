import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobTypeBadgeComponent } from './job-type-badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('JobTypeBadgeComponent', () => {
  let component: JobTypeBadgeComponent;
  let fixture: ComponentFixture<JobTypeBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobTypeBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(JobTypeBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should apply correct classes for FULL_TIME', () => {
    fixture.componentRef.setInput('type', 'FULL_TIME');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-applied');
    expect(component.label()).toBe('Full Time');
  });

  it('should apply correct classes for INTERNSHIP', () => {
    fixture.componentRef.setInput('type', 'INTERNSHIP');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-review');
    expect(component.label()).toBe('Internship');
  });

  it('should fallback for unknown type', () => {
    fixture.componentRef.setInput('type', 'UNKNOWN');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('bg-gray-100');
    expect(component.label()).toBe('UNKNOWN');
  });
});
