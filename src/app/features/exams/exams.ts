import { Component, effect, inject, signal, untracked } from '@angular/core';
import { DatePipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { ExamService } from '@core/services/exam.service';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';
import type { Exam, ExamType, ListExamsQuery } from '@core/models/exam';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-exams',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent, DatePipe],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class ExamsComponent {
  private readonly examService = inject(ExamService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly exams = signal<Exam[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListExamsQuery>({ page: 1, limit: 10 });

  readonly examTypes: ExamType[] = ['quiz', 'midterm', 'final', 'assignment', 'practical'];

  constructor() {
    effect(() => {
      this.schoolService.currentSchoolId();
      untracked(() => {
        this.query.set({ page: 1, limit: 10 });
        this.loadExams();
      });
    });
  }

  onTypeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value as ExamType | '';
    this.query.update((q) => ({ ...q, examType: value || undefined, page: 1 }));
    this.loadExams();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadExams();
  }

  private loadExams(): void {
    this.loading.set(true);
    this.error.set(null);

    this.examService.list(this.query()).subscribe({
      next: (res) => {
        this.exams.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('EXAMS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
