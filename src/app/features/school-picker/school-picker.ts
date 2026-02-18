import { Component, inject, OnInit, signal } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { AuthService } from '@core/services/auth.service';
import { SchoolService } from '@core/services/school.service';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher';
import type { School } from '@core/models/school';

@Component({
  selector: 'app-school-picker',
  imports: [RouterLink, TranslatePipe, ThemeToggleComponent, LanguageSwitcherComponent],
  templateUrl: './school-picker.html',
})
export class SchoolPickerComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly schoolService = inject(SchoolService);
  private readonly router = inject(Router);

  readonly schools = signal<School[]>([]);
  readonly loading = signal(false);

  ngOnInit(): void {
    const user = this.authService.user();
    if (!user) {
      this.router.navigate(['/login']);
      return;
    }

    // Single-school user: auto-redirect to their school
    if (user.schools.length === 1) {
      this.router.navigate(['/schools', user.schools[0].id, 'dashboard']);
      return;
    }

    // Multi-school user: show their assigned schools
    if (user.schools.length > 1) {
      this.schools.set(user.schools);
      return;
    }

    // Super admin (no school-scoped roles): fetch all platform schools
    this.loading.set(true);
    this.schoolService.fetchSchools().subscribe({
      next: (res) => {
        this.schools.set(res.data);
        this.loading.set(false);

        // Auto-redirect if only one school on the platform
        if (res.data.length === 1) {
          this.router.navigate(['/schools', res.data[0].id, 'dashboard']);
        }
      },
      error: () => this.loading.set(false),
    });
  }

  logout(): void {
    this.authService.logout();
  }
}
