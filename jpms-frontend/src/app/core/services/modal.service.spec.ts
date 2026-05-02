import { TestBed } from '@angular/core/testing';
import { ModalService } from './modal.service';
import { describe, it, expect, beforeEach } from 'vitest';

describe('ModalService', () => {
  let service: ModalService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(ModalService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should open confirmation modal', () => {
    const config = { title: 'Test', message: 'Test message' };
    service.confirm(config);
    
    const state = service.modalState();
    expect(state.isOpen).toBe(true);
    expect(state.options?.title).toBe('Test');
  });

  it('should resolve with value and close', async () => {
    const promise = service.confirm({ title: 'Test', message: 'Test' });
    service.resolve(true);
    
    const result = await promise;
    expect(result).toBe(true);
    expect(service.modalState().isOpen).toBe(false);
  });
});
