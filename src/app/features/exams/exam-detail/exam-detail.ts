import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ExamService } from '@core/services/exam.service';
import { SubjectService } from '@core/services/subject.service';
import { GradeService } from '@core/services/grade.service';
import { SchoolService } from '@core/services/school.service';
import type { Exam, ExamSubject } from '@core/models/exam';
import type { Subject } from '@core/models/subject';
import type { Grade } from '@core/models/grade';

@Component({
  selector: 'app-exam-detail',
  imports: [RouterLink, ReactiveFormsModule, TranslatePipe, IconComponent],
  templateUrl: './exam-detail.html',
  styleUrl: './exam-detail.css',
})
export class ExamDetailComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly examService = inject(ExamService);
  private readonly subjectService = inject(SubjectService);
  private readonly gradeService = inject(GradeService);
  private readonly schoolService = inject(SchoolService);

  readonly listRoute = computed(() => `/schools/${this.schoolService.currentSchoolId()}/exams`);
  readonly exam = signal<Exam | null>(null);
  readonly examSubjects = signal<ExamSubject[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  // Add subject modal
  readonly showAddSubject = signal(false);
  readonly addingSubject = signal(false);
  readonly subjects = signal<Subject[]>([]);
  readonly grades = signal<Grade[]>([]);

  readonly addSubjectForm = this.fb.nonNullable.group({
    subjectId: ['', Validators.required],
    gradeId: ['', Validators.required],
    maxScore: [100, [Validators.required, Validators.min(1), Validators.max(999)]],
    passScore: [null as number | null],
    examDate: [''],
    examTime: [''],
  });

  private get examId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadExam();
    this.loadExamSubjects();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteExam(): void {
    this.deleting.set(true);
    this.examService.delete(this.examId).subscribe({
      next: () => {
        this.router.navigate([this.listRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  openAddSubject(): void {
    this.addSubjectForm.reset({ maxScore: 100 });
    this.subjectService.list({ limit: 100 }).subscribe({
      next: (res) => this.subjects.set(res.data),
    });
    this.gradeService.list({ limit: 100 }).subscribe({
      next: (res) => this.grades.set(res.data),
    });
    this.showAddSubject.set(true);
  }

  closeAddSubject(): void {
    this.showAddSubject.set(false);
  }

  submitAddSubject(): void {
    if (this.addSubjectForm.invalid) {
      this.addSubjectForm.markAllAsTouched();
      return;
    }

    this.addingSubject.set(true);
    const val = this.addSubjectForm.getRawValue();

    this.examService
      .addSubject(this.examId, {
        subjectId: val.subjectId,
        gradeId: val.gradeId,
        maxScore: val.maxScore,
        passScore: val.passScore ?? undefined,
        examDate: val.examDate || undefined,
        examTime: val.examTime || undefined,
      })
      .subscribe({
        next: () => {
          this.addingSubject.set(false);
          this.showAddSubject.set(false);
          this.loadExamSubjects();
        },
        error: () => {
          this.addingSubject.set(false);
        },
      });
  }

  removeSubject(subjectId: string): void {
    this.examService.removeSubject(this.examId, subjectId).subscribe({
      next: () => this.loadExamSubjects(),
    });
  }

  private loadExam(): void {
    this.loading.set(true);
    this.error.set(null);
    this.examService.get(this.examId).subscribe({
      next: (res) => {
        this.exam.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('EXAMS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private loadExamSubjects(): void {
    this.examService.listSubjects(this.examId).subscribe({
      next: (res) => this.examSubjects.set(res.data),
    });
  }
}
