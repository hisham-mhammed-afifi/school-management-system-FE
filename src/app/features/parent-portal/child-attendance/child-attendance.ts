import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { GuardianPortalService } from '@core/services/guardian-portal.service';
import { SchoolService } from '@core/services/school.service';
import type { StudentAttendance, StudentAttendanceStatus } from '@core/models/attendance';
import type { ChildAttendanceQuery } from '@core/models/guardian';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-child-attendance',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    IconComponent,
    PaginationComponent,
    DatePipe,
    NgClass,
  ],
  templateUrl: './child-attendance.html',
  styleUrl: './child-attendance.css',
})
export class ChildAttendanceComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(GuardianPortalService);
  private readonly schoolService = inject(SchoolService);

  readonly portalRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/parent-portal`,
  );

  readonly records = signal<StudentAttendance[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ChildAttendanceQuery>({ page: 1, limit: 20 });

  private get studentId(): string {
    return this.route.snapshot.paramMap.get('studentId')!;
  }

  readonly childTabsBase = computed(() => `${this.portalRoute()}/${this.studentId}`);

  ngOnInit(): void {
    this.loadAttendance();
  }

  onFilterFrom(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, from: value || undefined, page: 1 }));
    this.loadAttendance();
  }

  onFilterTo(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, to: value || undefined, page: 1 }));
    this.loadAttendance();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadAttendance();
  }

  statusClass(status: StudentAttendanceStatus): string {
    switch (status) {
      case 'present':
        return 'bg-success-bg text-success-text';
      case 'absent':
        return 'bg-danger-bg text-danger-text';
      case 'late':
        return 'bg-warning-bg text-warning-text';
      case 'excused':
        return 'bg-info-bg text-info-text';
    }
  }

  private loadAttendance(): void {
    this.loading.set(true);
    this.error.set(null);

    this.portalService.listChildAttendance(this.studentId, this.query()).subscribe({
      next: (res) => {
        this.records.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('PARENT_PORTAL.LOAD_ATTENDANCE_ERROR');
        this.loading.set(false);
      },
    });
  }
}
