import { ComponentFixture, TestBed } from '@angular/core/testing';
import { StatusBadgeComponent } from './status-badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('StatusBadgeComponent', () => {
  let component: StatusBadgeComponent;
  let fixture: ComponentFixture<StatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(StatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should apply correct classes for APPLIED', () => {
    fixture.componentRef.setInput('status', 'APPLIED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-applied');
  });

  it('should apply correct classes for UNDER_REVIEW', () => {
    fixture.componentRef.setInput('status', 'UNDER_REVIEW');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-review');
  });

  it('should apply correct classes for SHORTLISTED', () => {
    fixture.componentRef.setInput('status', 'SHORTLISTED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-shortlisted');
  });

  it('should apply correct classes for REJECTED', () => {
    fixture.componentRef.setInput('status', 'REJECTED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-rejected');
  });
});
