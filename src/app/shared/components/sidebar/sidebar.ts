import { Component, computed, inject, input, output } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SchoolService } from '@core/services/school.service';
import { PermissionService } from '@core/services/permission.service';

export interface SidebarItem {
  labelKey: string;
  route: string;
  icon: string;
  permissions?: string[];
  roles?: string[];
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
  private readonly permissionService = inject(PermissionService);

  private readonly allNavItems = computed<SidebarItem[]>(() => {
    const schoolId = this.schoolService.currentSchoolId();
    const prefix = schoolId ? `/schools/${schoolId}` : '';
    return [
      {
        labelKey: 'NAV.DASHBOARD',
        route: `${prefix}/dashboard`,
        icon: 'gauge',
        permissions: ['dashboard.read'],
      },
      {
        labelKey: 'NAV.USERS',
        route: `${prefix}/users`,
        icon: 'users',
        permissions: ['users.list'],
      },
      {
        labelKey: 'NAV.STUDENTS',
        route: `${prefix}/students`,
        icon: 'graduation-cap',
        permissions: ['students.list'],
      },
      {
        labelKey: 'NAV.TEACHERS',
        route: `${prefix}/teachers`,
        icon: 'chalkboard-user',
        permissions: ['teachers.list'],
      },
      {
        labelKey: 'NAV.CLASSES',
        route: `${prefix}/class-sections`,
        icon: 'layer-group',
        permissions: ['class-sections.list'],
      },
      {
        labelKey: 'NAV.SUBJECTS',
        route: `${prefix}/subjects`,
        icon: 'microscope',
        permissions: ['subjects.list'],
      },
      {
        labelKey: 'NAV.TIMETABLE',
        route: `${prefix}/timetable`,
        icon: 'calendar-days',
        permissions: ['lessons.list'],
      },
      {
        labelKey: 'NAV.ATTENDANCE',
        route: `${prefix}/attendance`,
        icon: 'clipboard-check',
        permissions: ['student-attendance.list'],
      },
      {
        labelKey: 'NAV.GRADING_SCALES',
        route: `${prefix}/grading-scales`,
        icon: 'scale-balanced',
        permissions: ['grading-scales.list'],
      },
      {
        labelKey: 'NAV.EXAMS',
        route: `${prefix}/exams`,
        icon: 'file-pen',
        permissions: ['exams.list'],
      },
      {
        labelKey: 'NAV.GRADE_ENTRY',
        route: `${prefix}/grade-entry`,
        icon: 'keyboard',
        permissions: ['student-grades.list'],
      },
      {
        labelKey: 'NAV.REPORT_CARDS',
        route: `${prefix}/report-cards`,
        icon: 'file-lines',
        permissions: ['report-cards.list'],
      },
      {
        labelKey: 'NAV.FEE_STRUCTURES',
        route: `${prefix}/fee-structures`,
        icon: 'money-bill-wave',
        permissions: ['fee-structures.list'],
      },
      {
        labelKey: 'NAV.FEE_INVOICES',
        route: `${prefix}/fee-invoices`,
        icon: 'file-invoice-dollar',
        permissions: ['fee-invoices.list'],
      },
      {
        labelKey: 'NAV.PARENT_PORTAL',
        route: `${prefix}/parent-portal`,
        icon: 'house-user',
        roles: ['guardian'],
      },
      {
        labelKey: 'NAV.ROLES',
        route: `${prefix}/roles`,
        icon: 'shield-halved',
        permissions: ['roles.list'],
      },
    ];
  });

  readonly navItems = computed<SidebarItem[]>(() =>
    this.allNavItems().filter((item) => {
      if (item.roles && !item.roles.some((r) => this.permissionService.hasRole(r))) {
        return false;
      }
      if (item.permissions && !this.permissionService.hasAnyPermission(...item.permissions)) {
        return false;
      }
      return true;
    }),
  );

  close(): void {
    this.closed.emit();
  }
}
