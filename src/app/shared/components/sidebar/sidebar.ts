import { Component, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

export interface SidebarItem {
  labelKey: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  readonly navItems: SidebarItem[] = [
    { labelKey: 'NAV.DASHBOARD', route: '/dashboard', icon: 'dashboard' },
    { labelKey: 'NAV.USERS', route: '/users', icon: 'people' },
    { labelKey: 'NAV.ROLES', route: '/roles', icon: 'admin_panel_settings' },
  ];

  close(): void {
    this.closed.emit();
  }
}
