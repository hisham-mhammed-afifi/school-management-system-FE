import { Component, inject, signal } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, TranslatePipe, ThemeToggleComponent, LanguageSwitcherComponent],
  templateUrl: './login.html',
  styleUrl: './login.css',
})
export class LoginComponent {
  private readonly fb = inject(FormBuilder);
  private readonly authService = inject(AuthService);
  private readonly router = inject(Router);

  readonly loading = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.loading.set(true);
    this.errorMessage.set(null);

    const { email, password } = this.form.getRawValue();
    this.authService.login({ email, password }).subscribe({
      next: () => {
        const user = this.authService.user();
        if (user && user.schools.length === 1) {
          this.router.navigate(['/schools', user.schools[0].id, 'dashboard']);
        } else {
          this.router.navigate(['/schools']);
        }
      },
      error: (err) => {
        this.loading.set(false);
        const body = err.error as ApiErrorResponse | undefined;
        this.errorMessage.set(body?.error?.message ?? 'AUTH.LOGIN_FAILED');
      },
    });
  }
}
