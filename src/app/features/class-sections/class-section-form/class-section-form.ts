import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ClassSectionService } from '@core/services/class-section.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { GradeService } from '@core/services/grade.service';
import { TeacherService } from '@core/services/teacher.service';
import { SchoolService } from '@core/services/school.service';
import type { ClassSection } from '@core/models/class-section';
import type { AcademicYear } from '@core/models/academic-year';
import type { Grade } from '@core/models/grade';
import type { Teacher } from '@core/models/teacher';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-class-section-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './class-section-form.html',
  styleUrl: './class-section-form.css',
})
export class ClassSectionFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly classSectionService = inject(ClassSectionService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly gradeService = inject(GradeService);
  private readonly teacherService = inject(TeacherService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/class-sections`,
  );
  readonly isEdit = signal(false);
  readonly sectionId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly grades = signal<Grade[]>([]);
  readonly teachers = signal<Teacher[]>([]);

  readonly form = this.fb.nonNullable.group({
    academicYearId: ['', [Validators.required]],
    gradeId: ['', [Validators.required]],
    name: ['', [Validators.required, Validators.maxLength(20)]],
    capacity: [30, [Validators.required, Validators.min(1)]],
    homeroomTeacherId: [''],
  });

  ngOnInit(): void {
    this.loadDropdowns();

    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.sectionId.set(id);
      this.form.controls.academicYearId.disable();
      this.form.controls.gradeId.disable();
      this.loadSection(id);
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
      this.classSectionService
        .update(this.sectionId()!, {
          name: formVal.name,
          capacity: formVal.capacity,
          homeroomTeacherId: formVal.homeroomTeacherId || null,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'class-sections',
              this.sectionId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.classSectionService
        .create({
          academicYearId: formVal.academicYearId,
          gradeId: formVal.gradeId,
          name: formVal.name,
          capacity: formVal.capacity,
          homeroomTeacherId: formVal.homeroomTeacherId || undefined,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'class-sections',
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
    this.teacherService.list({ limit: 100, status: 'active' }).subscribe({
      next: (res) => this.teachers.set(res.data),
    });
  }

  private loadSection(id: string): void {
    this.loading.set(true);
    this.classSectionService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('CLASS_SECTIONS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(section: ClassSection): void {
    this.form.patchValue({
      academicYearId: section.academicYearId,
      gradeId: section.gradeId,
      name: section.name,
      capacity: section.capacity,
      homeroomTeacherId: section.homeroomTeacherId ?? '',
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
