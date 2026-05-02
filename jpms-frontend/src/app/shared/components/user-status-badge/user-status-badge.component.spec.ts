import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserStatusBadgeComponent } from './user-status-badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserStatusBadgeComponent', () => {
  let component: UserStatusBadgeComponent;
  let fixture: ComponentFixture<UserStatusBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserStatusBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserStatusBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should apply correct classes for ACTIVE', () => {
    fixture.componentRef.setInput('status', 'ACTIVE');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-shortlisted');
    expect(component.label()).toBe('Active');
  });

  it('should apply correct classes for BANNED', () => {
    fixture.componentRef.setInput('status', 'BANNED');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-rejected');
    expect(component.label()).toBe('Banned');
  });

  it('should fallback for unknown status', () => {
    fixture.componentRef.setInput('status', 'PENDING');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-warning');
    expect(component.label()).toBe('Pending');
  });
});
