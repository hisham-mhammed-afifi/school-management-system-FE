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
          <span class="material-icons text-sm leading-none">{{ option.icon }}</span>
        </button>
      }
    </div>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);

  readonly options: { value: Theme; label: string; icon: string }[] = [
    { value: 'light', label: 'Light', icon: 'light_mode' },
    { value: 'system', label: 'System', icon: 'desktop_windows' },
    { value: 'dark', label: 'Dark', icon: 'dark_mode' },
  ];
}
