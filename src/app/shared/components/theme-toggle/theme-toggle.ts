import { Component, inject } from '@angular/core';
import { ThemeService, type Theme } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <div
      role="radiogroup"
      aria-label="Theme"
      class="flex rounded-lg border border-border overflow-hidden"
    >
      @for (option of options; track option.value) {
        <button
          type="button"
          role="radio"
          [attr.aria-checked]="themeService.theme() === option.value"
          [attr.aria-label]="option.label"
          (click)="themeService.setTheme(option.value)"
          class="px-2.5 py-1.5 text-xs cursor-pointer border-0 transition-colors not-first:border-s not-first:border-border"
          [class]="
            themeService.theme() === option.value
              ? 'bg-accent text-white'
              : 'bg-surface text-text-secondary hover:bg-surface-hover'
          "
        >
          {{ option.icon }}
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  readonly options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: '\u2600' },
    { value: 'system', label: 'System', icon: '\u2615' },
    { value: 'dark', label: 'Dark', icon: '\u263E' },
  ];
}
