import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { StudentService } from '@core/services/student.service';
import { SchoolService } from '@core/services/school.service';
import type { Student, BloodType, StudentStatus } from '@core/models/student';
import type { ApiErrorResponse } from '@core/models/api';

@Component({
  selector: 'app-student-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './student-form.html',
  styleUrl: './student-form.css',
})
export class StudentFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly studentService = inject(StudentService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly studentsRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/students`,
  );
  readonly isEdit = signal(false);
  readonly studentId = signal<string | null>(null);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly bloodTypes: BloodType[] = [
    'A_POS',
    'A_NEG',
    'B_POS',
    'B_NEG',
    'AB_POS',
    'AB_NEG',
    'O_POS',
    'O_NEG',
  ];

  readonly statuses: StudentStatus[] = [
    'active',
    'graduated',
    'withdrawn',
    'suspended',
    'transferred',
  ];

  readonly form = this.fb.nonNullable.group({
    studentCode: ['', [Validators.required, Validators.maxLength(30)]],
    firstName: ['', [Validators.required, Validators.maxLength(100)]],
    lastName: ['', [Validators.required, Validators.maxLength(100)]],
    dateOfBirth: ['', [Validators.required]],
    gender: ['male' as 'male' | 'female', [Validators.required]],
    nationalId: [''],
    nationality: [''],
    religion: [''],
    bloodType: ['' as string],
    address: [''],
    phone: [''],
    email: ['', [Validators.email]],
    medicalNotes: [''],
    admissionDate: ['', [Validators.required]],
    status: ['active' as StudentStatus],
  });

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.isEdit.set(true);
      this.studentId.set(id);
      this.form.controls.studentCode.disable();
      this.loadStudent(id);
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
      this.studentService
        .update(this.studentId()!, {
          firstName: formVal.firstName,
          lastName: formVal.lastName,
          dateOfBirth: formVal.dateOfBirth,
          gender: formVal.gender,
          nationalId: formVal.nationalId || null,
          nationality: formVal.nationality || null,
          religion: formVal.religion || null,
          bloodType: (formVal.bloodType as BloodType) || null,
          address: formVal.address || null,
          phone: formVal.phone || null,
          email: formVal.email || null,
          medicalNotes: formVal.medicalNotes || null,
          status: formVal.status,
        })
        .subscribe({
          next: () =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'students',
              this.studentId(),
            ]),
          error: (err) => this.handleError(err),
        });
    } else {
      this.studentService
        .create({
          studentCode: formVal.studentCode,
          firstName: formVal.firstName,
          lastName: formVal.lastName,
          dateOfBirth: formVal.dateOfBirth,
          gender: formVal.gender,
          nationalId: formVal.nationalId || undefined,
          nationality: formVal.nationality || undefined,
          religion: formVal.religion || undefined,
          bloodType: (formVal.bloodType as BloodType) || undefined,
          address: formVal.address || undefined,
          phone: formVal.phone || undefined,
          email: formVal.email || undefined,
          medicalNotes: formVal.medicalNotes || undefined,
          admissionDate: formVal.admissionDate,
        })
        .subscribe({
          next: (res) =>
            this.router.navigate([
              '/schools',
              this.schoolService.currentSchoolId(),
              'students',
              res.data.id,
            ]),
          error: (err) => this.handleError(err),
        });
    }
  }

  private loadStudent(id: string): void {
    this.loading.set(true);
    this.studentService.get(id).subscribe({
      next: (res) => {
        this.patchForm(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.errorMessage.set('STUDENTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private patchForm(student: Student): void {
    this.form.patchValue({
      studentCode: student.studentCode,
      firstName: student.firstName,
      lastName: student.lastName,
      dateOfBirth: student.dateOfBirth,
      gender: student.gender,
      nationalId: student.nationalId ?? '',
      nationality: student.nationality ?? '',
      religion: student.religion ?? '',
      bloodType: student.bloodType ?? '',
      address: student.address ?? '',
      phone: student.phone ?? '',
      email: student.email ?? '',
      medicalNotes: student.medicalNotes ?? '',
      admissionDate: student.admissionDate,
      status: student.status,
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
