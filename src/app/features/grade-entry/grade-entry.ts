import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ExamService } from '@core/services/exam.service';
import { EnrollmentService } from '@core/services/enrollment.service';
import { ClassSectionService } from '@core/services/class-section.service';
import { StudentGradeService } from '@core/services/student-grade.service';
import type { Exam, ExamSubject } from '@core/models/exam';
import type { ClassSection } from '@core/models/class-section';

export interface GradeEntryRow {
  studentId: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  score: number | null;
  notes: string;
  existingId: string | null;
  existingGradeLetter: string | null;
}

@Component({
  selector: 'app-grade-entry',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './grade-entry.html',
  styleUrl: './grade-entry.css',
})
export class GradeEntryComponent implements OnInit {
  private readonly examService = inject(ExamService);
  private readonly enrollmentService = inject(EnrollmentService);
  private readonly classSectionService = inject(ClassSectionService);
  private readonly studentGradeService = inject(StudentGradeService);

  readonly exams = signal<Exam[]>([]);
  readonly examSubjects = signal<ExamSubject[]>([]);
  readonly classSections = signal<ClassSection[]>([]);

  readonly selectedExamId = signal('');
  readonly selectedExamSubjectId = signal('');
  readonly selectedClassSectionId = signal('');
  readonly selectedMaxScore = signal(100);

  readonly rows = signal<GradeEntryRow[]>([]);
  readonly loading = signal(false);
  readonly saving = signal(false);
  readonly error = signal<string | null>(null);
  readonly saved = signal(false);

  ngOnInit(): void {
    this.loadExams();
    this.loadClassSections();
  }

  onExamChange(event: Event): void {
    const examId = (event.target as HTMLSelectElement).value;
    this.selectedExamId.set(examId);
    this.selectedExamSubjectId.set('');
    this.examSubjects.set([]);
    this.rows.set([]);
    this.saved.set(false);

    if (examId) {
      this.examService.listSubjects(examId).subscribe({
        next: (res) => this.examSubjects.set(res.data),
      });
    }
  }

  onExamSubjectChange(event: Event): void {
    const esId = (event.target as HTMLSelectElement).value;
    this.selectedExamSubjectId.set(esId);
    this.saved.set(false);

    const es = this.examSubjects().find((s) => s.id === esId);
    if (es) {
      this.selectedMaxScore.set(es.maxScore);
    }

    this.loadStudents();
  }

  onClassSectionChange(event: Event): void {
    const csId = (event.target as HTMLSelectElement).value;
    this.selectedClassSectionId.set(csId);
    this.saved.set(false);
    this.loadStudents();
  }

  onScoreChange(index: number, event: Event): void {
    const value = (event.target as HTMLInputElement).value;
    const score = value === '' ? null : Number(value);
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, score } : r)));
    this.saved.set(false);
  }

  onNotesChange(index: number, event: Event): void {
    const notes = (event.target as HTMLInputElement).value;
    this.rows.update((rows) => rows.map((r, i) => (i === index ? { ...r, notes } : r)));
    this.saved.set(false);
  }

  save(): void {
    const esId = this.selectedExamSubjectId();
    if (!esId || this.rows().length === 0) return;

    const grades = this.rows()
      .filter((r) => r.score !== null)
      .map((r) => ({
        studentId: r.studentId,
        score: r.score!,
        notes: r.notes || undefined,
      }));

    if (grades.length === 0) return;

    this.saving.set(true);
    this.error.set(null);
    this.saved.set(false);

    this.studentGradeService.bulkRecord({ examSubjectId: esId, grades }).subscribe({
      next: () => {
        this.saved.set(true);
        this.saving.set(false);
      },
      error: () => {
        this.error.set('GRADE_ENTRY.SAVE_ERROR');
        this.saving.set(false);
      },
    });
  }

  private loadExams(): void {
    this.examService.list({ limit: 100 }).subscribe({
      next: (res) => this.exams.set(res.data),
    });
  }

  private loadClassSections(): void {
    this.classSectionService.list({ limit: 100 }).subscribe({
      next: (res) => this.classSections.set(res.data),
    });
  }

  private loadStudents(): void {
    const csId = this.selectedClassSectionId();
    const esId = this.selectedExamSubjectId();
    if (!csId || !esId) {
      this.rows.set([]);
      return;
    }

    this.loading.set(true);
    this.error.set(null);

    this.enrollmentService.list({ classSectionId: csId, status: 'active', limit: 100 }).subscribe({
      next: (enrollRes) => {
        // Load existing grades for this exam subject
        this.studentGradeService.list({ examSubjectId: esId, limit: 100 }).subscribe({
          next: (gradeRes) => {
            const existingMap = new Map(gradeRes.data.map((g) => [g.studentId, g]));

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
                    score: existing?.score ?? null,
                    notes: existing?.notes ?? '',
                    existingId: existing?.id ?? null,
                    existingGradeLetter: existing?.gradeLetter ?? null,
                  };
                }),
            );
            this.loading.set(false);
          },
          error: () => {
            this.error.set('GRADE_ENTRY.LOAD_ERROR');
            this.loading.set(false);
          },
        });
      },
      error: () => {
        this.error.set('GRADE_ENTRY.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
