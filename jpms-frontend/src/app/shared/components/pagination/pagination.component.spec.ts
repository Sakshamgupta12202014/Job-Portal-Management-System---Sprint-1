import { ComponentFixture, TestBed } from '@angular/core/testing';
import { PaginationComponent } from './pagination.component';
import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('PaginationComponent', () => {
  let component: PaginationComponent;
  let fixture: ComponentFixture<PaginationComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PaginationComponent]
    }).compileComponents();

    fixture = TestBed.createComponent(PaginationComponent);
    component = fixture.componentInstance;
  });

  it('should not render if only one page', () => {
    fixture.componentRef.setInput('currentPage', 0);
    fixture.componentRef.setInput('totalPages', 1);
    fixture.componentRef.setInput('totalElements', 10);
    fixture.detectChanges();
    expect(fixture.nativeElement.textContent.trim()).toBe('');
  });

  it('should generate page numbers and emit events', () => {
    fixture.componentRef.setInput('currentPage', 2);
    fixture.componentRef.setInput('totalPages', 5);
    fixture.componentRef.setInput('totalElements', 50);
    fixture.detectChanges();

    const spy = vi.fn();
    component.pageChange.subscribe(spy);
    
    const buttons = fixture.nativeElement.querySelectorAll('button');
    // Prev button
    buttons[0].click();
    expect(spy).toHaveBeenCalledWith(1);

    // Page numbers
    buttons[2].click(); // Page 2
    expect(spy).toHaveBeenCalledWith(1);

    // Next button
    buttons[buttons.length - 1].click();
    expect(spy).toHaveBeenCalledWith(3);
  });

  it('should disable prev on first page and next on last page', () => {
    fixture.componentRef.setInput('currentPage', 0);
    fixture.componentRef.setInput('totalPages', 2);
    fixture.componentRef.setInput('totalElements', 20);
    fixture.detectChanges();
    
    const buttons = fixture.nativeElement.querySelectorAll('button');
    expect(buttons[0].disabled).toBe(true); // Prev
    expect(buttons[buttons.length - 1].disabled).toBe(false); // Next

    fixture.componentRef.setInput('currentPage', 1);
    fixture.detectChanges();
    expect(buttons[0].disabled).toBe(false);
    expect(buttons[buttons.length - 1].disabled).toBe(true);
  });
});
