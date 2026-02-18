import { Component, inject } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { Dir } from '@angular/cdk/bidi';
import { TranslationService } from '@core/services/translation.service';
import { ThemeService } from '@core/services/theme.service';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, Dir],
  templateUrl: './app.html',
  styleUrl: './app.css',
})
export class App {
  protected readonly translationService = inject(TranslationService);

  // Injecting ThemeService triggers its constructor which applies the theme
  private readonly themeService = inject(ThemeService);

  constructor() {
    this.translationService.init();
  }
}
