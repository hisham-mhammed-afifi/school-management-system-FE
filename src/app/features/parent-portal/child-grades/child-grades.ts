import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { GuardianPortalService } from '@core/services/guardian-portal.service';
import { SchoolService } from '@core/services/school.service';
import type { StudentGrade } from '@core/models/student-grade';
import type { ChildGradesQuery } from '@core/models/guardian';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-child-grades',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    IconComponent,
    PaginationComponent,
    DecimalPipe,
  ],
  templateUrl: './child-grades.html',
  styleUrl: './child-grades.css',
})
export class ChildGradesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(GuardianPortalService);
  private readonly schoolService = inject(SchoolService);

  readonly portalRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/parent-portal`,
  );

  readonly grades = signal<StudentGrade[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ChildGradesQuery>({ page: 1, limit: 20 });

  private get studentId(): string {
    return this.route.snapshot.paramMap.get('studentId')!;
  }

  readonly childTabsBase = computed(() => `${this.portalRoute()}/${this.studentId}`);

  ngOnInit(): void {
    this.loadGrades();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadGrades();
  }

  private loadGrades(): void {
    this.loading.set(true);
    this.error.set(null);

    this.portalService.listChildGrades(this.studentId, this.query()).subscribe({
      next: (res) => {
        this.grades.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('PARENT_PORTAL.LOAD_GRADES_ERROR');
        this.loading.set(false);
      },
    });
  }
}
