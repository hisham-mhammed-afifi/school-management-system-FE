import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { FeeStructureService } from '@core/services/fee-structure.service';
import { PermissionService } from '@core/services/permission.service';
import { FeeCategoryService } from '@core/services/fee-category.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { GradeService } from '@core/services/grade.service';
import type { FeeStructure, ListFeeStructuresQuery } from '@core/models/fee-structure';
import type { FeeCategory } from '@core/models/fee-category';
import type { AcademicYear } from '@core/models/academic-year';
import type { Grade } from '@core/models/grade';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-fee-structures',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent, DecimalPipe],
  templateUrl: './fee-structures.html',
  styleUrl: './fee-structures.css',
})
export class FeeStructuresComponent implements OnInit {
  private readonly feeStructureService = inject(FeeStructureService);
  readonly permissionService = inject(PermissionService);
  private readonly feeCategoryService = inject(FeeCategoryService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly gradeService = inject(GradeService);

  readonly structures = signal<FeeStructure[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListFeeStructuresQuery>({ page: 1, limit: 20 });

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly grades = signal<Grade[]>([]);
  readonly categories = signal<FeeCategory[]>([]);

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadStructures();
  }

  onFilterYear(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, page: 1, academicYearId: value || undefined }));
    this.loadStructures();
  }

  onFilterGrade(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, page: 1, gradeId: value || undefined }));
    this.loadStructures();
  }

  onFilterCategory(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, page: 1, feeCategoryId: value || undefined }));
    this.loadStructures();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadStructures();
  }

  private loadDropdowns(): void {
    this.academicYearService.list({ limit: 100 }).subscribe({
      next: (res) => this.academicYears.set(res.data),
    });
    this.gradeService.list({ limit: 100 }).subscribe({
      next: (res) => this.grades.set(res.data),
    });
    this.feeCategoryService.list({ limit: 100 }).subscribe({
      next: (res) => this.categories.set(res.data),
    });
  }

  private loadStructures(): void {
    this.loading.set(true);
    this.error.set(null);

    this.feeStructureService.list(this.query()).subscribe({
      next: (res) => {
        this.structures.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('FEE_STRUCTURES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
