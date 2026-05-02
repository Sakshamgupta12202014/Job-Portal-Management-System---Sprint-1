import { TestBed } from '@angular/core/testing';
import { ToastService } from './toast.service';
import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';

describe('ToastService', () => {
  let service: ToastService;

  beforeEach(() => {
    vi.useFakeTimers();
    TestBed.configureTestingModule({});
    service = TestBed.inject(ToastService);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should add success toast', () => {
    service.success('Success message');
    const toasts = service.toasts();
    expect(toasts.length).toBe(1);
    expect(toasts[0].type).toBe('success');
    expect(toasts[0].message).toBe('Success message');
  });

  it('should add error toast', () => {
    service.error('Error message');
    const toasts = service.toasts();
    expect(toasts[0].type).toBe('error');
  });

  it('should remove toast after delay', () => {
    service.success('Message');
    expect(service.toasts().length).toBe(1);
    
    vi.advanceTimersByTime(4000);
    expect(service.toasts().length).toBe(0);
  });

  it('should manually remove toast', () => {
    service.success('Message');
    const id = service.toasts()[0].id;
    service.dismiss(id);
    expect(service.toasts().length).toBe(0);
  });
});
