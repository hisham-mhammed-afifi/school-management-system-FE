import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SchoolService } from '@core/services/school.service';

export interface SidebarItem {
  labelKey: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-sidebar',
  imports: [RouterLink, RouterLinkActive, TranslatePipe, IconComponent],
  templateUrl: './sidebar.html',
  styleUrl: './sidebar.css',
})
export class SidebarComponent {
  readonly open = input(false);
  readonly closed = output<void>();

  private readonly schoolService = inject(SchoolService);

  readonly navItems = computed<SidebarItem[]>(() => {
    const schoolId = this.schoolService.currentSchoolId();
    const prefix = schoolId ? `/schools/${schoolId}` : '';
    return [
      { labelKey: 'NAV.DASHBOARD', route: `${prefix}/dashboard`, icon: 'gauge' },
      { labelKey: 'NAV.USERS', route: `${prefix}/users`, icon: 'users' },
      { labelKey: 'NAV.STUDENTS', route: `${prefix}/students`, icon: 'graduation-cap' },
      { labelKey: 'NAV.TEACHERS', route: `${prefix}/teachers`, icon: 'chalkboard-user' },
      { labelKey: 'NAV.ROLES', route: `${prefix}/roles`, icon: 'shield-halved' },
    ];
  });

  close(): void {
    this.closed.emit();
  }
}
