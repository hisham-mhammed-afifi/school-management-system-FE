import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { TeacherService } from '@core/services/teacher.service';
import { SchoolService } from '@core/services/school.service';
import type { Teacher, TeacherStatus } from '@core/models/teacher';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-teacher-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink],
  templateUrl: './teacher-form.html',
  styleUrl: './teacher-form.css',
})
export class TeacherFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly teacherService = inject(TeacherService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly teachersRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/teachers`,
  );
  readonly isEdit = signal(false);
  readonly teacherId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly statuses: TeacherStatus[] = ['active', 'on_leave', 'resigned', 'terminated'];

  readonly form = this.fb.nonNullable.group({
    teacherCode: ['', [Validators.required, Validators.maxLength(30)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    gender: ['male' as 'male' | 'female', [Validators.required]],
    nationalId: [''],
    phone: [''],
    email: ['', [Validators.email]],
    specialization: [''],
    qualification: [''],
    hireDate: ['', [Validators.required]],
    status: ['active' as TeacherStatus],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.teacherId.set(id);
      this.form.controls.teacherCode.disable();
      this.loadTeacher(id);
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
      this.teacherService
        .update(this.teacherId()!, {
          firstName: formVal.firstName,
          lastName: formVal.lastName,
          gender: formVal.gender,
          nationalId: formVal.nationalId || null,
          phone: formVal.phone || null,
          email: formVal.email || null,
          specialization: formVal.specialization || null,
          qualification: formVal.qualification || null,
          status: formVal.status,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'teachers',
              this.teacherId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.teacherService
        .create({
          teacherCode: formVal.teacherCode,
          firstName: formVal.firstName,
          lastName: formVal.lastName,
          gender: formVal.gender,
          nationalId: formVal.nationalId || undefined,
          phone: formVal.phone || undefined,
          email: formVal.email || undefined,
          specialization: formVal.specialization || undefined,
          qualification: formVal.qualification || undefined,
          hireDate: formVal.hireDate,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'teachers',
              res.data.id,
            ]),
          error: (err) => this.handleError(err),
        });
    }
  }

  private loadTeacher(id: string): void {
    this.loading.set(true);
    this.teacherService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('TEACHERS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(teacher: Teacher): void {
    this.form.patchValue({
      teacherCode: teacher.teacherCode,
      firstName: teacher.firstName,
      lastName: teacher.lastName,
      gender: teacher.gender,
      nationalId: teacher.nationalId ?? '',
      phone: teacher.phone ?? '',
      email: teacher.email ?? '',
      specialization: teacher.specialization ?? '',
      qualification: teacher.qualification ?? '',
      hireDate: teacher.hireDate,
      status: teacher.status,
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
