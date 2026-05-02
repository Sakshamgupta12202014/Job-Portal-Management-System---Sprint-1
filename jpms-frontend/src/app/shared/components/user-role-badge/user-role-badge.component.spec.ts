import { ComponentFixture, TestBed } from '@angular/core/testing';
import { UserRoleBadgeComponent } from './user-role-badge.component';
import { describe, it, expect, beforeEach } from 'vitest';

describe('UserRoleBadgeComponent', () => {
  let component: UserRoleBadgeComponent;
  let fixture: ComponentFixture<UserRoleBadgeComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [UserRoleBadgeComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(UserRoleBadgeComponent);
    component = fixture.componentInstance;
  });

  it('should apply correct classes for ADMIN', () => {
    fixture.componentRef.setInput('role', 'ADMIN');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-review');
    expect(component.label()).toBe('Administrator');
  });

  it('should apply correct classes for RECRUITER', () => {
    fixture.componentRef.setInput('role', 'RECRUITER');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('status-applied');
    expect(component.label()).toBe('Recruiter');
  });

  it('should fallback for unknown role', () => {
    fixture.componentRef.setInput('role', 'GUEST');
    fixture.detectChanges();
    expect(component.badgeClass()).toContain('bg-gray-100');
    expect(component.label()).toBe('GUEST');
  });
});
