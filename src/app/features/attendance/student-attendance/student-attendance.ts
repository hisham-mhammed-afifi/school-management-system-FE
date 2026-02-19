import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ClassSectionService } from '@core/services/class-section.service';
import { EnrollmentService } from '@core/services/enrollment.service';
import { StudentAttendanceService } from '@core/services/student-attendance.service';
import type { ClassSection } from '@core/models/class-section';
import type { StudentAttendanceStatus } from '@core/models/attendance';

export interface StudentAttendanceRow {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  status: StudentAttendanceStatus;
  notes: string;
  existingId: string | null;
}

@Component({
  selector: 'app-student-attendance',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './student-attendance.html',
  styleUrl: './student-attendance.css',
})
export class StudentAttendanceComponent implements OnInit {
  private readonly classSectionService = inject(ClassSectionService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly attendanceService = inject(StudentAttendanceService);

  readonly classSections = signal<ClassSection[]>([]);
  readonly selectedClassId = signal('');
  readonly selectedDate = signal('');
  readonly rows = signal<StudentAttendanceRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  readonly statuses: StudentAttendanceStatus[] = ['present', 'absent', 'late', 'excused'];

  ngOnInit(): void {
    this.selectedDate.set(new Date().toISOString().slice(0, 10));
    this.loadClassSections();
  }

  onClassChange(event: Event): void {
    const classId = (event.target as HTMLSelectElement).value;
    this.selectedClassId.set(classId);
    this.saved.set(false);
    this.loadAttendance();
  }

  onDateChange(event: Event): void {
    const date = (event.target as HTMLInputElement).value;
    this.selectedDate.set(date);
    this.saved.set(false);
    this.loadAttendance();
  }

  onStatusChange(index: number, event: Event): void {
    const status = (event.target as HTMLSelectElement).value as StudentAttendanceStatus;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, status } : r)));
    this.saved.set(false);
  }

  onNotesChange(index: number, event: Event): void {
    const notes = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, notes } : r)));
    this.saved.set(false);
  }

  markAll(event: Event): void {
    const status = (event.target as HTMLSelectElement).value as StudentAttendanceStatus;
    if (!status) return;
    this.rows.update((rows) => rows.map((r) => ({ ...r, status })));
    this.saved.set(false);
  }

  save(): void {
    const classId = this.selectedClassId();
    const date = this.selectedDate();
    if (!classId || !date || this.rows().length === 0) return;

    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.attendanceService
      .bulkRecord({
        classSectionId: classId,
        date,
        records: this.rows().map((r) => ({
          studentId: r.studentId,
          status: r.status,
          notes: r.notes || undefined,
        })),
      })
      .subscribe({
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

  private loadClassSections(): void {
    this.classSectionService.list({ limit: 100 }).subscribe({
      next: (res) => this.classSections.set(res.data),
    });
  }

  private loadAttendance(): void {
    const classId = this.selectedClassId();
    const date = this.selectedDate();
    if (!classId || !date) {
      this.rows.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.enrollmentService
      .list({ classSectionId: classId, status: 'active', limit: 100 })
      .subscribe({
        next: (enrollRes) => {
          this.attendanceService.list({ classSectionId: classId, date, limit: 100 }).subscribe({
            next: (attRes) => {
              const existingMap = new Map(attRes.data.map((a) => [a.studentId, a]));
              this.rows.set(
                enrollRes.data
                  .filter((e) => e.student)
                  .map((e) => {
                    const existing = existingMap.get(e.studentId);
                    return {
                      studentId: e.studentId,
                      studentCode: e.student!.studentCode,
                      firstName: e.student!.firstName,
                      lastName: e.student!.lastName,
                      status: existing?.status ?? 'present',
                      notes: existing?.notes ?? '',
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
