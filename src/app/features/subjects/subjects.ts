import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SubjectService } from '@core/services/subject.service';
import { GradeService } from '@core/services/grade.service';
import { PaginationComponent } from '@shared/components/pagination/pagination';
import type { Subject, ListSubjectsQuery } from '@core/models/subject';
import type { Grade } from '@core/models/grade';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-subjects',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './subjects.html',
  styleUrl: './subjects.css',
})
export class SubjectsComponent implements OnInit {
  private readonly subjectService = inject(SubjectService);
  private readonly gradeService = inject(GradeService);

  readonly subjects = signal<Subject[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListSubjectsQuery>({ page: 1, limit: 20 });
  readonly grades = signal<Grade[]>([]);

  ngOnInit(): void {
    this.loadGrades();
    this.loadSubjects();
  }

  onSearch(event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    this.query.update((q) => ({ ...q, search: value || undefined, page: 1 }));
    this.loadSubjects();
  }

  onGradeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, gradeId: value || undefined, page: 1 }));
    this.loadSubjects();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadSubjects();
  }

  private loadGrades(): void {
    this.gradeService.list({ page: 1, limit: 100 }).subscribe({
      next: (res) => this.grades.set(res.data),
    });
  }

  private loadSubjects(): void {
    this.loading.set(true);
    this.error.set(null);

    this.subjectService.list(this.query()).subscribe({
      next: (res) => {
        this.subjects.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('SUBJECTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
