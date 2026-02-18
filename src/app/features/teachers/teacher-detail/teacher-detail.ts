import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { DatePipe } from '@angular/common';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';

import { TeacherService } from '@core/services/teacher.service';
import { SchoolService } from '@core/services/school.service';
import type { Teacher } from '@core/models/teacher';

@Component({
  selector: 'app-teacher-detail',
  imports: [DatePipe, RouterLink, TranslatePipe],
  templateUrl: './teacher-detail.html',
  styleUrl: './teacher-detail.css',
})
export class TeacherDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly teacherService = inject(TeacherService);
  private readonly schoolService = inject(SchoolService);

  readonly teachersRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/teachers`,
  );
  readonly teacher = signal<Teacher | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  private get teacherId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadTeacher();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteTeacher(): void {
    this.deleting.set(true);
    this.teacherService.delete(this.teacherId).subscribe({
      next: () => {
        this.router.navigate([this.teachersRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  private loadTeacher(): void {
    this.loading.set(true);
    this.error.set(null);
    this.teacherService.get(this.teacherId).subscribe({
      next: (res) => {
        this.teacher.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('TEACHERS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
