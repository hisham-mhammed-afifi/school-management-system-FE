import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SubjectService } from '@core/services/subject.service';
import { SchoolService } from '@core/services/school.service';
import type { Subject } from '@core/models/subject';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-subject-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './subject-form.html',
  styleUrl: './subject-form.css',
})
export class SubjectFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly subjectService = inject(SubjectService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly subjectsRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/subjects`,
  );
  readonly isEdit = signal(false);
  readonly subjectId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    code: ['', [Validators.required, Validators.maxLength(20)]],
    isLab: [false],
    isElective: [false],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.subjectId.set(id);
      this.loadSubject(id);
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
      this.subjectService
        .update(this.subjectId()!, {
          name: formVal.name,
          code: formVal.code,
          isLab: formVal.isLab,
          isElective: formVal.isElective,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'subjects',
              this.subjectId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.subjectService
        .create({
          name: formVal.name,
          code: formVal.code,
          isLab: formVal.isLab || undefined,
          isElective: formVal.isElective || undefined,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'subjects',
              res.data.id,
            ]),
          error: (err) => this.handleError(err),
        });
    }
  }

  private loadSubject(id: string): void {
    this.loading.set(true);
    this.subjectService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('SUBJECTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(subject: Subject): void {
    this.form.patchValue({
      name: subject.name,
      code: subject.code,
      isLab: subject.isLab,
      isElective: subject.isElective,
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
