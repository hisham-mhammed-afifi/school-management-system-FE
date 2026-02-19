import { Component, inject, signal, OnInit } from '@angular/core';
import { forkJoin, type Observable } from 'rxjs';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { TeacherService } from '@core/services/teacher.service';
import { TeacherAttendanceService } from '@core/services/teacher-attendance.service';
import type { Teacher } from '@core/models/teacher';
import type { TeacherAttendanceStatus, TeacherAttendance } from '@core/models/attendance';
import type { ApiResponse } from '@core/models/api';

export interface TeacherAttendanceRow {
  teacherId: string;
  teacherCode: string;
  firstName: string;
  lastName: string;
  status: TeacherAttendanceStatus;
  checkIn: string;
  checkOut: string;
  existingId: string | null;
}

@Component({
  selector: 'app-teacher-attendance',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './teacher-attendance.html',
  styleUrl: './teacher-attendance.css',
})
export class TeacherAttendanceComponent implements OnInit {
  private readonly teacherService = inject(TeacherService);
  private readonly attendanceService = inject(TeacherAttendanceService);

  readonly selectedDate = signal('');
  readonly rows = signal<TeacherAttendanceRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  readonly statuses: TeacherAttendanceStatus[] = ['present', 'absent', 'late', 'on_leave'];

  ngOnInit(): void {
    this.selectedDate.set(new Date().toISOString().slice(0, 10));
    this.loadAttendance();
  }

  onDateChange(event: Event): void {
    const date = (event.target as HTMLInputElement).value;
    this.selectedDate.set(date);
    this.saved.set(false);
    this.loadAttendance();
  }

  onStatusChange(index: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as TeacherAttendanceStatus;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, status } : r)));
    this.saved.set(false);
  }

  onCheckInChange(index: number, event: Event): void {
    const checkIn = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, checkIn } : r)));
    this.saved.set(false);
  }

  onCheckOutChange(index: number, event: Event): void {
    const checkOut = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, checkOut } : r)));
    this.saved.set(false);
  }

  save(): void {
    const date = this.selectedDate();
    if (!date || this.rows().length === 0) return;

    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    const requests: Observable<ApiResponse<TeacherAttendance>>[] = this.rows().map((row) => {
      if (row.existingId) {
        return this.attendanceService.correct(row.existingId, {
          status: row.status,
          checkIn: row.checkIn || undefined,
          checkOut: row.checkOut || undefined,
        });
      }
      return this.attendanceService.record({
        teacherId: row.teacherId,
        date,
        status: row.status,
        checkIn: row.checkIn || undefined,
        checkOut: row.checkOut || undefined,
      });
    });

    forkJoin(requests).subscribe({
      next: () => {
        this.saved.set(true);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('ATTENDANCE.SAVE_ERROR');
        this.saving.set(false);
      },
    });
  }

  private loadAttendance(): void {
    const date = this.selectedDate();
    if (!date) {
      this.rows.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.teacherService.list({ limit: 100, status: 'active' }).subscribe({
      next: (teacherRes) => {
        this.attendanceService.list({ date, limit: 100 }).subscribe({
          next: (attRes) => {
            const existingMap = new Map(attRes.data.map((a) => [a.teacherId, a]));
            this.rows.set(
              teacherRes.data.map((t: Teacher) => {
                const existing = existingMap.get(t.id);
                return {
                  teacherId: t.id,
                  teacherCode: t.teacherCode,
                  firstName: t.firstName,
                  lastName: t.lastName,
                  status: existing?.status ?? 'present',
                  checkIn: existing?.checkIn ?? '',
                  checkOut: existing?.checkOut ?? '',
                  existingId: existing?.id ?? null,
                };
              }),
            );
            this.loading.set(false);
          },
          error: () => {
            this.error.set('ATTENDANCE.LOAD_ERROR');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('ATTENDANCE.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
