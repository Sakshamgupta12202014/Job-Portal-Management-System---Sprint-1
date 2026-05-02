import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ToastComponent } from './toast.component';
import { ToastService, Toast } from '../../../core/services/toast.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal } from '@angular/core';

describe('ToastComponent', () => {
  let component: ToastComponent;
  let fixture: ComponentFixture<ToastComponent>;
  let toastServiceMock: any;

  beforeEach(async () => {
    // Ensure toasts is a signal (function) in the mock
    const toastsSignal = signal<Toast[]>([]);
    toastServiceMock = {
      toasts: toastsSignal,
      dismiss: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ToastComponent],
      providers: [
        { provide: ToastService, useValue: toastServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ToastComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should render toasts when available', () => {
    const mockToasts: Toast[] = [{ id: 1, type: 'success', message: 'Test Success' }];
    toastServiceMock.toasts.set(mockToasts);
    fixture.detectChanges();
    
    const toastElement = fixture.nativeElement.querySelector('p');
    expect(toastElement.textContent).toContain('Test Success');
  });

  it('should return correct classes for toast types', () => {
    const toast: Toast = { id: 1, type: 'success', message: 'test' };
    expect(component.getClasses(toast)).toContain('emerald');
    
    toast.type = 'error';
    expect(component.getClasses(toast)).toContain('red');
    
    toast.type = 'warning';
    expect(component.getClasses(toast)).toContain('yellow');
    
    toast.type = 'info';
    expect(component.getClasses(toast)).toContain('primary');
  });

  it('should return correct icons', () => {
    expect(component.getIcon('success')).toBe('✓');
    expect(component.getIcon('error')).toBe('✕');
    expect(component.getIcon('warning')).toBe('⚠');
    expect(component.getIcon('info')).toBe('ℹ');
    expect(component.getIcon('unknown')).toBe('ℹ');
  });

  it('should call dismiss when close button is clicked', () => {
    const mockToasts: Toast[] = [{ id: 1, type: 'success', message: 'Test Success' }];
    toastServiceMock.toasts.set(mockToasts);
    fixture.detectChanges();

    const closeButton = fixture.nativeElement.querySelector('button');
    closeButton.click();
    expect(toastServiceMock.dismiss).toHaveBeenCalledWith(1);
  });
});
