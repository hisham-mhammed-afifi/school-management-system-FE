import { Injectable, signal, computed, effect, inject, DestroyRef } from '@angular/core';

export type Theme = 'light' | 'dark' | 'system';
export type ResolvedTheme = 'light' | 'dark';

const STORAGE_KEY = 'theme';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly destroyRef = inject(DestroyRef);
  private readonly darkMediaQuery = window.matchMedia('(prefers-color-scheme: dark)');

  readonly theme = signal<Theme>(this.loadTheme());
  readonly osDark = signal(this.darkMediaQuery.matches);
  readonly resolvedTheme = computed<ResolvedTheme>(() => {
    const t = this.theme();
    if (t === 'system') {
      return this.osDark() ? 'dark' : 'light';
    }
    return t;
  });

  constructor() {
    const onMediaChange = (e: MediaQueryListEvent): void => this.osDark.set(e.matches);
    this.darkMediaQuery.addEventListener('change', onMediaChange);
    this.destroyRef.onDestroy(() =>
      this.darkMediaQuery.removeEventListener('change', onMediaChange),
    );

    effect(() => {
      this.applyTheme(this.resolvedTheme());
    });
  }

  setTheme(theme: Theme): void {
    this.theme.set(theme);
    if (theme === 'system') {
      localStorage.removeItem(STORAGE_KEY);
    } else {
      localStorage.setItem(STORAGE_KEY, theme);
    }
  }

  private applyTheme(resolved: ResolvedTheme): void {
    const classList = document.documentElement.classList;
    if (resolved === 'dark') {
      classList.add('dark');
    } else {
      classList.remove('dark');
    }

    const meta = document.querySelector('meta[name="color-scheme"]');
    if (meta) {
      meta.setAttribute('content', resolved);
    }
  }

  private loadTheme(): Theme {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (stored === 'dark' || stored === 'light') {
      return stored;
    }
    return 'system';
  }
}
