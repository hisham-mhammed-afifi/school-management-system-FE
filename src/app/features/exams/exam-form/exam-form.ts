import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ExamService } from '@core/services/exam.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { TermService } from '@core/services/term.service';
import { GradingScaleService } from '@core/services/grading-scale.service';
import { SchoolService } from '@core/services/school.service';
import type { Exam, ExamType } from '@core/models/exam';
import type { AcademicYear } from '@core/models/academic-year';
import type { Term } from '@core/models/term';
import type { GradingScale } from '@core/models/grading-scale';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-exam-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './exam-form.html',
  styleUrl: './exam-form.css',
})
export class ExamFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly examService = inject(ExamService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly termService = inject(TermService);
  private readonly gradingScaleService = inject(GradingScaleService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly listRoute = computed(() => `/schools/${this.schoolService.currentSchoolId()}/exams`);
  readonly isEdit = signal(false);
  readonly examId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly gradingScales = signal<GradingScale[]>([]);
  readonly examTypes: ExamType[] = ['quiz', 'midterm', 'final', 'assignment', 'practical'];

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    examType: ['' as ExamType | '', Validators.required],
    academicYearId: ['', Validators.required],
    termId: ['', Validators.required],
    gradingScaleId: ['', Validators.required],
    weight: [100, [Validators.min(0), Validators.max(100)]],
    startDate: [''],
    endDate: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.examId.set(id);
      this.loadExam(id);
    }
  }

  onAcademicYearChange(): void {
    const yearId = this.form.controls.academicYearId.value;
    this.form.controls.termId.setValue('');
    this.terms.set([]);
    if (yearId) {
      this.termService.listByYear(yearId).subscribe({
        next: (res) => this.terms.set(res.data),
      });
    }
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const val = this.form.getRawValue();

    if (this.isEdit()) {
      this.examService
        .update(this.examId()!, {
          name: val.name,
          examType: val.examType as ExamType,
          weight: val.weight,
          gradingScaleId: val.gradingScaleId,
          startDate: val.startDate || undefined,
          endDate: val.endDate || undefined,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'exams',
              this.examId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.examService
        .create({
          name: val.name,
          examType: val.examType as ExamType,
          academicYearId: val.academicYearId,
          termId: val.termId,
          gradingScaleId: val.gradingScaleId,
          weight: val.weight,
          startDate: val.startDate || undefined,
          endDate: val.endDate || undefined,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'exams',
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
    this.gradingScaleService.list({ limit: 100 }).subscribe({
      next: (res) => this.gradingScales.set(res.data),
    });
  }

  private loadExam(id: string): void {
    this.loading.set(true);
    this.examService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('EXAMS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(exam: Exam): void {
    this.form.patchValue({
      name: exam.name,
      examType: exam.examType,
      academicYearId: exam.academicYearId,
      termId: exam.termId,
      gradingScaleId: exam.gradingScaleId,
      weight: exam.weight,
      startDate: exam.startDate ?? '',
      endDate: exam.endDate ?? '',
    });
    // Load terms for the selected academic year
    if (exam.academicYearId) {
      this.termService.listByYear(exam.academicYearId).subscribe({
        next: (res) => {
          this.terms.set(res.data);
          this.form.controls.termId.setValue(exam.termId);
        },
      });
    }
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
