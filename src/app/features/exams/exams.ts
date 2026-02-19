import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { ExamService } from '@core/services/exam.service';
import type { Exam, ExamType, ListExamsQuery } from '@core/models/exam';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-exams',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './exams.html',
  styleUrl: './exams.css',
})
export class ExamsComponent implements OnInit {
  private readonly examService = inject(ExamService);

  readonly exams = signal<Exam[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListExamsQuery>({ page: 1, limit: 20 });

  readonly examTypes: ExamType[] = ['quiz', 'midterm', 'final', 'assignment', 'practical'];

  ngOnInit(): void {
    this.loadExams();
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
