import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { StudentService } from '@core/services/student.service';
import { SchoolService } from '@core/services/school.service';
import type { Student } from '@core/models/student';

@Component({
  selector: 'app-student-detail',
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './student-detail.html',
  styleUrl: './student-detail.css',
})
export class StudentDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly studentService = inject(StudentService);
  private readonly schoolService = inject(SchoolService);

  readonly studentsRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/students`,
  );
  readonly student = signal<Student | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  private get studentId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadStudent();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteStudent(): void {
    this.deleting.set(true);
    this.studentService.delete(this.studentId).subscribe({
      next: () => {
        this.router.navigate([this.studentsRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  private loadStudent(): void {
    this.loading.set(true);
    this.error.set(null);
    this.studentService.get(this.studentId).subscribe({
      next: (res) => {
        this.student.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('STUDENTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
