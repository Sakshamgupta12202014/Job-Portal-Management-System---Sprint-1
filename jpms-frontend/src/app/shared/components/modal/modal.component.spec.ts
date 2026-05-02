import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ModalComponent } from './modal.component';
import { ModalService } from '../../../core/services/modal.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';

describe('ModalComponent', () => {
  let component: ModalComponent;
  let fixture: ComponentFixture<ModalComponent>;
  let modalStateMock: WritableSignal<any>;
  let modalServiceMock: any;

  beforeEach(async () => {
    modalStateMock = signal({ 
      isOpen: false, 
      options: {
        title: 'Default Title', 
        message: 'Default Message',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info'
      }
    });

    modalServiceMock = {
      modalState: modalStateMock,
      resolve: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ModalComponent],
      providers: [
        { provide: ModalService, useValue: modalServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ModalComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });

  it('should lock body scroll when open', () => {
    modalStateMock.set({ ...modalStateMock(), isOpen: true });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('hidden');

    modalStateMock.set({ ...modalStateMock(), isOpen: false });
    fixture.detectChanges();
    expect(document.body.style.overflow).toBe('auto');
  });

  it('should handle confirm and cancel actions', () => {
    component.handleConfirm();
    expect(modalServiceMock.resolve).toHaveBeenCalledWith(true);

    component.handleCancel();
    expect(modalServiceMock.resolve).toHaveBeenCalledWith(false);
  });

  it('should return correct type classes', () => {
    expect(component.getTypeClass('danger')).toContain('red');
    expect(component.getTypeClass('warning')).toContain('amber');
    expect(component.getTypeClass('success')).toContain('emerald');
    expect(component.getTypeClass()).toContain('primary');
  });

  it('should return correct button classes', () => {
    expect(component.getButtonClass('danger')).toContain('red');
    expect(component.getButtonClass('warning')).toContain('amber');
    expect(component.getButtonClass('success')).toContain('emerald');
    expect(component.getButtonClass()).toContain('primary');
  });

  it('should render modal content when open', () => {
    modalStateMock.set({ 
      isOpen: true, 
      options: {
        title: 'Delete Job', 
        message: 'Sure?', 
        confirmText: 'Yes', 
        cancelText: 'No', 
        type: 'danger' 
      }
    });
    fixture.detectChanges();
    
    const compiled = fixture.nativeElement;
    expect(compiled.querySelector('h2').textContent).toContain('Delete Job');
    
    // Check all paragraphs for the message (trimmed)
    const paragraphs = Array.from(compiled.querySelectorAll('p')).map((p: any) => p.textContent.trim());
    expect(paragraphs).toContain('Sure?');
  });
});
