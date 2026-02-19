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
      { labelKey: 'NAV.CLASSES', route: `${prefix}/class-sections`, icon: 'layer-group' },
      { labelKey: 'NAV.SUBJECTS', route: `${prefix}/subjects`, icon: 'microscope' },
      { labelKey: 'NAV.TIMETABLE', route: `${prefix}/timetable`, icon: 'calendar-days' },
      { labelKey: 'NAV.ATTENDANCE', route: `${prefix}/attendance`, icon: 'clipboard-check' },
      { labelKey: 'NAV.GRADING_SCALES', route: `${prefix}/grading-scales`, icon: 'scale-balanced' },
      { labelKey: 'NAV.EXAMS', route: `${prefix}/exams`, icon: 'file-pen' },
      { labelKey: 'NAV.GRADE_ENTRY', route: `${prefix}/grade-entry`, icon: 'keyboard' },
      { labelKey: 'NAV.REPORT_CARDS', route: `${prefix}/report-cards`, icon: 'file-lines' },
      {
        labelKey: 'NAV.FEE_STRUCTURES',
        route: `${prefix}/fee-structures`,
        icon: 'money-bill-wave',
      },
      {
        labelKey: 'NAV.FEE_INVOICES',
        route: `${prefix}/fee-invoices`,
        icon: 'file-invoice-dollar',
      },
      { labelKey: 'NAV.ROLES', route: `${prefix}/roles`, icon: 'shield-halved' },
    ];
  });

  close(): void {
    this.closed.emit();
  }
}
