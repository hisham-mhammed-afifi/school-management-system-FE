import { TestBed } from '@angular/core/testing';
import { ThemeService } from './theme.service';

function createMockMatchMedia(prefersDark: boolean) {
  const listeners: ((e: MediaQueryListEvent) => void)[] = [];
  const mql = {
    matches: prefersDark,
    media: '(prefers-color-scheme: dark)',
    addEventListener: (_event: string, fn: (e: MediaQueryListEvent) => void) => listeners.push(fn),
    removeEventListener: (_event: string, fn: (e: MediaQueryListEvent) => void) => {
      const idx = listeners.indexOf(fn);
      if (idx >= 0) listeners.splice(idx, 1);
    },
    dispatchEvent: () => true,
  };

  function triggerChange(matches: boolean) {
    mql.matches = matches;
    listeners.forEach((fn) => fn({ matches } as MediaQueryListEvent));
  }

  return { mql, triggerChange, listeners };
}

describe('ThemeService', () => {
  let originalMatchMedia: typeof window.matchMedia;
  let mockMedia: ReturnType<typeof createMockMatchMedia>;

  beforeEach(() => {
    localStorage.clear();
    document.documentElement.classList.remove('dark');

    originalMatchMedia = window.matchMedia;
    mockMedia = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mockMedia.mql);
  });

  afterEach(() => {
    window.matchMedia = originalMatchMedia;
    localStorage.clear();
    document.documentElement.classList.remove('dark');
  });

  function createService(): ThemeService {
    TestBed.configureTestingModule({});
    return TestBed.inject(ThemeService);
  }

  it('should default to "system" when no localStorage value exists', () => {
    const service = createService();
    expect(service.theme()).toBe('system');
  });

  it('should read stored "dark" preference and apply .dark class', () => {
    localStorage.setItem('theme', 'dark');
    const service = createService();
    expect(service.theme()).toBe('dark');
    expect(service.resolvedTheme()).toBe('dark');
    TestBed.flushEffects();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('should read stored "light" preference and remove .dark class', () => {
    document.documentElement.classList.add('dark');
    localStorage.setItem('theme', 'light');
    const service = createService();
    expect(service.theme()).toBe('light');
    expect(service.resolvedTheme()).toBe('light');
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

  it('should remove localStorage key when setTheme("system") is called', () => {
    const service = createService();
    service.setTheme('dark');
    service.setTheme('system');
    expect(localStorage.getItem('theme')).toBeNull();
  });

  it('should resolve "system" to "dark" when OS prefers dark', () => {
    mockMedia = createMockMatchMedia(true);
    window.matchMedia = vi.fn().mockReturnValue(mockMedia.mql);
    const service = createService();
    expect(service.theme()).toBe('system');
    expect(service.resolvedTheme()).toBe('dark');
  });

  it('should resolve "system" to "light" when OS prefers light', () => {
    mockMedia = createMockMatchMedia(false);
    window.matchMedia = vi.fn().mockReturnValue(mockMedia.mql);
    const service = createService();
    expect(service.theme()).toBe('system');
    expect(service.resolvedTheme()).toBe('light');
  });

  it('should react to OS preference changes when in "system" mode', () => {
    const service = createService();
    expect(service.resolvedTheme()).toBe('light');

    mockMedia.triggerChange(true);
    expect(service.resolvedTheme()).toBe('dark');

    mockMedia.triggerChange(false);
    expect(service.resolvedTheme()).toBe('light');
  });

  it('should NOT react to OS preference changes when in explicit mode', () => {
    const service = createService();
    service.setTheme('light');
    TestBed.flushEffects();

    mockMedia.triggerChange(true);
    expect(service.resolvedTheme()).toBe('light');

    service.setTheme('dark');
    mockMedia.triggerChange(false);
    expect(service.resolvedTheme()).toBe('dark');
  });
});
