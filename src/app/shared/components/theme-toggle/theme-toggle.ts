import { Component, inject } from '@angular/core';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="themeService.theme() === 'dark'"
      aria-label="Dark mode"
      (click)="themeService.toggle()"
      class="p-2 rounded-lg border-0 bg-transparent text-text-secondary cursor-pointer transition-colors hover:bg-surface-hover"
    >
      @if (themeService.theme() === 'dark') {
        <span class="material-icons text-lg leading-none">dark_mode</span>
      } @else {
        <span class="material-icons text-lg leading-none">light_mode</span>
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
