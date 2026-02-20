import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { ClassSectionService } from '@core/services/class-section.service';
import { PermissionService } from '@core/services/permission.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { GradeService } from '@core/services/grade.service';
import type { ClassSection, ListClassSectionsQuery } from '@core/models/class-section';
import type { AcademicYear } from '@core/models/academic-year';
import type { Grade } from '@core/models/grade';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-class-sections',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './class-sections.html',
  styleUrl: './class-sections.css',
})
export class ClassSectionsComponent implements OnInit {
  private readonly classSectionService = inject(ClassSectionService);
  readonly permissionService = inject(PermissionService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly gradeService = inject(GradeService);

  readonly sections = signal<ClassSection[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly query = signal<ListClassSectionsQuery>({ page: 1, limit: 20 });

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly grades = signal<Grade[]>([]);

  ngOnInit(): void {
    this.loadFilters();
    this.loadSections();
  }

  onYearFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, academicYearId: value || undefined, page: 1 }));
    this.loadSections();
  }

  onGradeFilter(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, gradeId: value || undefined, page: 1 }));
    this.loadSections();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadSections();
  }

  private loadFilters(): void {
    this.academicYearService.list({ limit: 100 }).subscribe({
      next: (res) => this.academicYears.set(res.data),
    });
    this.gradeService.list({ limit: 100 }).subscribe({
      next: (res) => this.grades.set(res.data),
    });
  }

  private loadSections(): void {
    this.loading.set(true);
    this.error.set(null);

    this.classSectionService.list(this.query()).subscribe({
      next: (res) => {
        this.sections.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('CLASS_SECTIONS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
