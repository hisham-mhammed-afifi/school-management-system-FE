import { Injectable, inject, signal, computed } from '@angular/core';
import type { Direction } from '@angular/cdk/bidi';
import { TranslateService } from '@ngx-translate/core';

export type AppLanguage = 'en' | 'ar';

const STORAGE_KEY = 'app_lang';
const RTL_LANGUAGES: ReadonlySet<string> = new Set(['ar']);

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private readonly translateService = inject(TranslateService);

  readonly availableLanguages = ['en', 'ar'] as const;
  readonly currentLang = signal<AppLanguage>('en');
  readonly direction = computed<Direction>(() =>
    RTL_LANGUAGES.has(this.currentLang()) ? 'rtl' : 'ltr',
  );

  init(): void {
    const lang = this.resolveInitialLanguage();
    this.applyLanguage(lang);
  }

  switchLanguage(lang: AppLanguage): void {
    this.applyLanguage(lang);
  }

  private applyLanguage(lang: AppLanguage): void {
    this.translateService.use(lang);
    this.currentLang.set(lang);
    localStorage.setItem(STORAGE_KEY, lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = RTL_LANGUAGES.has(lang) ? 'rtl' : 'ltr';
  }

  private resolveInitialLanguage(): AppLanguage {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved && this.isValidLanguage(saved)) {
      return saved;
    }

    const browserLang = this.translateService.getBrowserLang();
    if (browserLang && this.isValidLanguage(browserLang)) {
      return browserLang;
    }

    return 'en';
  }

  private isValidLanguage(lang: string): lang is AppLanguage {
    return this.availableLanguages.includes(lang as AppLanguage);
  }
}
