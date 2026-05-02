import { ComponentFixture, TestBed } from '@angular/core/testing';
import { JobCardComponent } from './job-card.component';
import { provideRouter } from '@angular/router';
import { describe, it, expect, beforeEach } from 'vitest';

describe('JobCardComponent', () => {
  let component: JobCardComponent;
  let fixture: ComponentFixture<JobCardComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [JobCardComponent],
      providers: [provideRouter([])]
    }).compileComponents();

    fixture = TestBed.createComponent(JobCardComponent);
    component = fixture.componentInstance;
  });

  it('should parse skills correctly', () => {
    fixture.componentRef.setInput('job', { 
      id: 1, 
      title: 'Test', 
      skillsRequired: 'Java, Spring , Angular,, Docker, AWS' 
    } as any);
    
    const skills = component.getSkills(component.job().skillsRequired);
    expect(skills).toEqual(['Java', 'Spring', 'Angular', 'Docker']);
  });

  it('should handle empty skills', () => {
    expect(component.getSkills('')).toEqual([]);
  });

  it('should format salary correctly', () => {
    fixture.componentRef.setInput('job', { salary: 1500000 } as any);
    expect(component.formatSalary()).toBe('1.5M');

    fixture.componentRef.setInput('job', { salary: 50000 } as any);
    expect(component.formatSalary()).toBe('50K');

    fixture.componentRef.setInput('job', { salary: 500 } as any);
    expect(component.formatSalary()).toBe('500');
  });

  it('should calculate days remaining and urgency', () => {
    const future = new Date();
    future.setDate(future.getDate() + 2);
    fixture.componentRef.setInput('job', { deadline: future.toISOString() } as any);
    
    expect(component.getDaysRemaining()).toBeGreaterThan(0);
    expect(component.isUrgent()).toBe(true);

    const farFuture = new Date();
    farFuture.setDate(farFuture.getDate() + 10);
    fixture.componentRef.setInput('job', { deadline: farFuture.toISOString() } as any);
    expect(component.isUrgent()).toBe(false);

    const past = new Date();
    past.setDate(past.getDate() - 1);
    fixture.componentRef.setInput('job', { deadline: past.toISOString() } as any);
    expect(component.getDaysRemaining()).toBe(0);
  });
});
