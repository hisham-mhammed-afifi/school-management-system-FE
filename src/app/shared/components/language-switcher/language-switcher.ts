import { Component, inject } from '@angular/core';
import { TranslationService } from '@core/services/translation.service';

@Component({
  selector: 'app-language-switcher',
  template: `
    <button
      (click)="toggleLanguage()"
      type="button"
      [attr.aria-label]="
        translationService.currentLang() === 'en' ? 'Switch to Arabic' : 'Switch to English'
      "
      class="cursor-pointer px-3 py-1.5 border border-border rounded-md bg-transparent font-medium text-sm transition-colors hover:bg-surface-hover"
    >
      {{ translationService.currentLang() === 'en' ? 'AR' : 'EN' }}
    </button>
  `,
})
export class LanguageSwitcherComponent {
  readonly translationService = inject(TranslationService);

  toggleLanguage(): void {
    const next = this.translationService.currentLang() === 'en' ? 'ar' : 'en';
    this.translationService.switchLanguage(next);
  }
}
