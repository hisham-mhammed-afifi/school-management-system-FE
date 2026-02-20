import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { TeacherService } from '@core/services/teacher.service';
import { PermissionService } from '@core/services/permission.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import type { Teacher, ListTeachersQuery, TeacherStatus } from '@core/models/teacher';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-teachers',
  imports: [DatePipe, RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './teachers.html',
  styleUrl: './teachers.css',
})
export class TeachersComponent implements OnInit {
  private readonly teacherService = inject(TeacherService);
  readonly permissionService = inject(PermissionService);

  readonly teachers = signal<Teacher[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListTeachersQuery>({ page: 1, limit: 10 });

  readonly statuses: TeacherStatus[] = ['active', 'on_leave', 'resigned', 'terminated'];

  ngOnInit(): void {
    this.loadTeachers();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, search: value || undefined, page: 1 }));
    this.loadTeachers();
  }

  onStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      status: (value || undefined) as TeacherStatus | undefined,
      page: 1,
    }));
    this.loadTeachers();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadTeachers();
  }

  private loadTeachers(): void {
    this.loading.set(true);
    this.error.set(null);

    this.teacherService.list(this.query()).subscribe({
      next: (res) => {
        this.teachers.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('TEACHERS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
