import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe, TranslateDirective } from '@ngx-translate/core';
import { Dir } from '@angular/cdk/bidi';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';
import { TranslationService } from '@core/services/translation.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [
    RouterOutlet,
    TranslatePipe,
    TranslateDirective,
    LanguageSwitcherComponent,
    ThemeToggleComponent,
    Dir,
  ],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly translationService = inject(TranslationService);
  protected readonly userName = 'Mohamed';

  // Injecting ThemeService triggers its constructor which applies the theme
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.translationService.init();
  }
}
