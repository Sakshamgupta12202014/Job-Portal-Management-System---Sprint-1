import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Component } from '@angular/core';

@Component({ 
  template: '',
  standalone: true 
})
class TestComponent {
  constructor(public theme: ThemeService) {}
}

describe('ThemeService', () => {
  let service: ThemeService;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
    
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
  });

  it('should toggle theme and update state', async () => {
    const fixture = TestBed.configureTestingModule({
      imports: [TestComponent],
      providers: [ThemeService]
    }).createComponent(TestComponent);
    
    service = fixture.componentInstance.theme;
    fixture.detectChanges();
    
    const initial = service.isDarkMode();
    service.toggleTheme();
    fixture.detectChanges();
    
    expect(service.isDarkMode()).toBe(!initial);
    expect(localStorage.getItem('jpms-theme')).toBe('dark');

    service.toggleTheme();
    fixture.detectChanges();
    expect(localStorage.getItem('jpms-theme')).toBe('light');
  });

  it('should load theme from localStorage (dark)', () => {
    localStorage.setItem('jpms-theme', 'dark');
    service = TestBed.inject(ThemeService);
    expect(service.isDarkMode()).toBe(true);
  });

  it('should fallback to system preference (dark)', () => {
    Object.defineProperty(window, 'matchMedia', {
      writable: true,
      configurable: true,
      value: vi.fn().mockImplementation(query => ({
        matches: true,
        media: query,
        onchange: null,
        addListener: vi.fn(),
        removeListener: vi.fn(),
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        dispatchEvent: vi.fn(),
      })),
    });
    service = TestBed.inject(ThemeService);
    expect(service.isDarkMode()).toBe(true);
  });
});
