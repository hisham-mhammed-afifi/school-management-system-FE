import { Component, inject } from '@angular/core';
import { IconComponent } from '@shared/components/icon/icon';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-theme-toggle',
  imports: [IconComponent],
  template: `
    <button
      type="button"
      role="switch"
      [attr.aria-checked]="themeService.theme() === 'dark'"
      aria-label="Dark mode"
      (click)="themeService.toggle()"
      class="inline-flex items-center p-2 rounded-lg border-0 bg-transparent text-text-secondary cursor-pointer transition-colors hover:bg-surface-hover"
    >
      @if (themeService.theme() === 'dark') {
        <fa-icon icon="moon" class="text-lg leading-none" />
      } @else {
        <fa-icon icon="sun" class="text-lg leading-none" />
      }
    </button>
  `,
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
