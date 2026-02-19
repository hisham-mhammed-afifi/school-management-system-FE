import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { StudentService } from '@core/services/student.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import type { Student, ListStudentsQuery, StudentStatus } from '@core/models/student';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-students',
  imports: [DatePipe, RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './students.html',
  styleUrl: './students.css',
})
export class StudentsComponent implements OnInit {
  private readonly studentService = inject(StudentService);

  readonly students = signal<Student[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListStudentsQuery>({ page: 1, limit: 20 });

  readonly statuses: StudentStatus[] = [
    'active',
    'graduated',
    'withdrawn',
    'suspended',
    'transferred',
  ];

  ngOnInit(): void {
    this.loadStudents();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, search: value || undefined, page: 1 }));
    this.loadStudents();
  }

  onStatusFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      status: (value || undefined) as StudentStatus | undefined,
      page: 1,
    }));
    this.loadStudents();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadStudents();
  }

  private loadStudents(): void {
    this.loading.set(true);
    this.error.set(null);

    this.studentService.list(this.query()).subscribe({
      next: (res) => {
        this.students.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('STUDENTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
