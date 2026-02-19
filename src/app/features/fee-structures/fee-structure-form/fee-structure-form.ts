import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { FeeStructureService } from '@core/services/fee-structure.service';
import { FeeCategoryService } from '@core/services/fee-category.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { GradeService } from '@core/services/grade.service';
import { SchoolService } from '@core/services/school.service';
import type { FeeStructure, Recurrence } from '@core/models/fee-structure';
import type { FeeCategory } from '@core/models/fee-category';
import type { AcademicYear } from '@core/models/academic-year';
import type { Grade } from '@core/models/grade';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-fee-structure-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './fee-structure-form.html',
  styleUrl: './fee-structure-form.css',
})
export class FeeStructureFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly feeStructureService = inject(FeeStructureService);
  private readonly feeCategoryService = inject(FeeCategoryService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly gradeService = inject(GradeService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/fee-structures`,
  );
  readonly isEdit = signal(false);
  readonly structureId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly grades = signal<Grade[]>([]);
  readonly categories = signal<FeeCategory[]>([]);

  readonly recurrenceOptions: Recurrence[] = ['monthly', 'quarterly', 'term', 'annual'];

  readonly form = this.fb.nonNullable.group({
    academicYearId: ['', [Validators.required]],
    gradeId: ['', [Validators.required]],
    feeCategoryId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(100)]],
    amount: [0, [Validators.required, Validators.min(0)]],
    dueDate: [''],
    isRecurring: [false],
    recurrence: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.structureId.set(id);
      this.form.controls.academicYearId.disable();
      this.form.controls.gradeId.disable();
      this.form.controls.feeCategoryId.disable();
      this.loadStructure(id);
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();

    if (this.isEdit()) {
      this.feeStructureService
        .update(this.structureId()!, {
          name: formVal.name,
          amount: formVal.amount,
          dueDate: formVal.dueDate || undefined,
          isRecurring: formVal.isRecurring,
          recurrence: formVal.isRecurring
            ? (formVal.recurrence as Recurrence) || undefined
            : undefined,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'fee-structures',
              this.structureId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.feeStructureService
        .create({
          academicYearId: formVal.academicYearId,
          gradeId: formVal.gradeId,
          feeCategoryId: formVal.feeCategoryId,
          name: formVal.name,
          amount: formVal.amount,
          dueDate: formVal.dueDate || undefined,
          isRecurring: formVal.isRecurring,
          recurrence: formVal.isRecurring
            ? (formVal.recurrence as Recurrence) || undefined
            : undefined,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'fee-structures',
              res.data.id,
            ]),
          error: (err) => this.handleError(err),
        });
    }
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

  private loadStructure(id: string): void {
    this.loading.set(true);
    this.feeStructureService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('FEE_STRUCTURES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(s: FeeStructure): void {
    this.form.patchValue({
      academicYearId: s.academicYearId,
      gradeId: s.gradeId,
      feeCategoryId: s.feeCategoryId,
      name: s.name,
      amount: s.amount,
      dueDate: s.dueDate ?? '',
      isRecurring: s.isRecurring,
      recurrence: s.recurrence ?? '',
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
