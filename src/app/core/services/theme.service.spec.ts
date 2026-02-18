import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

describe('ThemeService', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  afterEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('should default to "light" when no localStorage value exists', () => {
    const service = createService();
    expect(service.theme()).toBe('light');
  });

  it('should read stored "dark" preference and apply .dark class', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.theme()).toBe('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should read stored "light" preference and remove .dark class', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');
    const service = createService();
    expect(service.theme()).toBe('light');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
  });

  it('should add .dark class when setTheme("dark") is called', () => {
    const service = createService();
    service.setTheme('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should remove .dark class when setTheme("light") is called', () => {
    const service = createService();
    service.setTheme('dark');
    TestBed.flushEffects();
    service.setTheme('light');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(false);
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should toggle from light to dark', () => {
    const service = createService();
    expect(service.theme()).toBe('light');
    service.toggle();
    expect(service.theme()).toBe('dark');
    expect(localStorage.getItem('theme')).toBe('dark');
  });

  it('should toggle from dark to light', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.theme()).toBe('dark');
    service.toggle();
    expect(service.theme()).toBe('light');
    expect(localStorage.getItem('theme')).toBe('light');
  });

  it('should treat invalid stored value as "light"', () => {
    localStorage.setItem('theme', 'system');
    const service = createService();
    expect(service.theme()).toBe('light');
  });
});
