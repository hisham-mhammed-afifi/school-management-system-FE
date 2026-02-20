import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkTrapFocus, LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { SubjectService } from '@core/services/subject.service';
import { PermissionService } from '@core/services/permission.service';
import { GradeService } from '@core/services/grade.service';
import { SchoolService } from '@core/services/school.service';
import type { Subject } from '@core/models/subject';
import type { Grade } from '@core/models/grade';

@Component({
  selector: 'app-subject-detail',
  imports: [RouterLink, TranslatePipe, IconComponent, CdkTrapFocus],
  templateUrl: './subject-detail.html',
  styleUrl: './subject-detail.css',
})
export class SubjectDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly subjectService = inject(SubjectService);
  private readonly gradeService = inject(GradeService);
  private readonly schoolService = inject(SchoolService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translate = inject(TranslateService);
  readonly permissionService = inject(PermissionService);

  readonly subjectsRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/subjects`,
  );
  readonly subject = signal<Subject | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  // Grade management
  readonly allGrades = signal<Grade[]>([]);
  readonly selectedGradeIds = signal<Set<string>>(new Set());
  readonly showGradeManager = signal(false);
  readonly savingGrades = signal(false);
  readonly gradeMessage = signal<string | null>(null);

  private get subjectId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadSubject();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteSubject(): void {
    this.deleting.set(true);
    this.subjectService.delete(this.subjectId).subscribe({
      next: () => {
        this.liveAnnouncer.announce(this.translate.instant('COMMON.SUCCESS'), 'polite');
        this.router.navigate([this.subjectsRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  openGradeManager(): void {
    this.gradeMessage.set(null);
    this.gradeService.list({ page: 1, limit: 100 }).subscribe({
      next: (res) => {
        this.allGrades.set(res.data);
        const currentIds = new Set(this.subject()?.subjectGrades.map((sg) => sg.gradeId) ?? []);
        this.selectedGradeIds.set(currentIds);
        this.showGradeManager.set(true);
      },
    });
  }

  closeGradeManager(): void {
    this.showGradeManager.set(false);
  }

  toggleGrade(gradeId: string): void {
    this.selectedGradeIds.update((ids) => {
      const next = new Set(ids);
      if (next.has(gradeId)) {
        next.delete(gradeId);
      } else {
        next.add(gradeId);
      }
      return next;
    });
  }

  isGradeSelected(gradeId: string): boolean {
    return this.selectedGradeIds().has(gradeId);
  }

  saveGrades(): void {
    this.savingGrades.set(true);
    this.gradeMessage.set(null);
    this.subjectService.setGrades(this.subjectId, [...this.selectedGradeIds()]).subscribe({
      next: () => {
        this.liveAnnouncer.announce(this.translate.instant('COMMON.SUCCESS'), 'polite');
        this.savingGrades.set(false);
        this.showGradeManager.set(false);
        this.gradeMessage.set('SUBJECTS.GRADES_SAVED');
        this.loadSubject();
      },
      error: () => {
        this.savingGrades.set(false);
      },
    });
  }

  private loadSubject(): void {
    this.loading.set(true);
    this.error.set(null);
    this.subjectService.get(this.subjectId).subscribe({
      next: (res) => {
        this.subject.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('SUBJECTS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
