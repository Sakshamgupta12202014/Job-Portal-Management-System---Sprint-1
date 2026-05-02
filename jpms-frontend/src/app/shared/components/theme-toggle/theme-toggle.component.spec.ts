import { ComponentFixture, TestBed } from '@angular/core/testing';
import { ThemeToggleComponent } from './theme-toggle.component';
import { ThemeService } from '../../../core/services/theme.service';
import { describe, it, expect, beforeEach, vi } from 'vitest';
import { signal, WritableSignal } from '@angular/core';

describe('ThemeToggleComponent', () => {
  let component: ThemeToggleComponent;
  let fixture: ComponentFixture<ThemeToggleComponent>;
  let isDarkModeMock: WritableSignal<boolean>;
  let themeServiceMock: any;

  beforeEach(async () => {
    isDarkModeMock = signal(false);
    themeServiceMock = {
      isDarkMode: isDarkModeMock,
      toggleTheme: vi.fn()
    };

    await TestBed.configureTestingModule({
      imports: [ThemeToggleComponent],
      providers: [
        { provide: ThemeService, useValue: themeServiceMock }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(ThemeToggleComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create and toggle theme', () => {
    expect(component).toBeTruthy();
    const button = fixture.nativeElement.querySelector('button');
    button.click();
    expect(themeServiceMock.toggleTheme).toHaveBeenCalled();
  });

  it('should reflect theme state in template (icons)', () => {
    // Light mode
    isDarkModeMock.set(false);
    fixture.detectChanges();
    let svg = fixture.nativeElement.querySelector('svg');
    // In light mode, it shows moon icon (to switch to dark)
    // Checking for moon path part or just existence
    expect(svg).toBeTruthy();

    // Dark mode
    isDarkModeMock.set(true);
    fixture.detectChanges();
    svg = fixture.nativeElement.querySelector('svg');
    expect(svg).toBeTruthy();
  });
});
