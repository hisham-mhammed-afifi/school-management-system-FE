import { Component, inject, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SidebarComponent } from '@shared/components/sidebar/sidebar';
import { ThemeToggleComponent } from '@shared/components/theme-toggle/theme-toggle';
import { LanguageSwitcherComponent } from '@shared/components/language-switcher/language-switcher';
import { NotificationBellComponent } from '@shared/components/notification-bell/notification-bell';
import { AuthService } from '@core/services/auth.service';

@Component({
  selector: 'app-layout',
  imports: [
    RouterOutlet,
    TranslatePipe,
    SidebarComponent,
    ThemeToggleComponent,
    LanguageSwitcherComponent,
    NotificationBellComponent,
    IconComponent,
  ],
  templateUrl: './layout.html',
  styleUrl: './layout.css',
})
export class LayoutComponent {
  private readonly authService = inject(AuthService);

  readonly user = this.authService.user;
  readonly sidebarOpen = signal(false);

  toggleSidebar(): void {
    this.sidebarOpen.update((open) => !open);
  }

  closeSidebar(): void {
    this.sidebarOpen.set(false);
  }

  logout(): void {
    this.authService.logout();
  }
}
