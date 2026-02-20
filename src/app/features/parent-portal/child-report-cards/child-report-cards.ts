import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { GuardianPortalService } from '@core/services/guardian-portal.service';
import { SchoolService } from '@core/services/school.service';
import type { ReportCard } from '@core/models/report-card';
import type { ChildPaginationQuery } from '@core/models/guardian';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-child-report-cards',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    IconComponent,
    PaginationComponent,
    DatePipe,
    DecimalPipe,
  ],
  templateUrl: './child-report-cards.html',
  styleUrl: './child-report-cards.css',
})
export class ChildReportCardsComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(GuardianPortalService);
  private readonly schoolService = inject(SchoolService);

  readonly portalRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/parent-portal`,
  );

  readonly reportCards = signal<ReportCard[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ChildPaginationQuery>({ page: 1, limit: 10 });

  private get studentId(): string {
    return this.route.snapshot.paramMap.get('studentId')!;
  }

  readonly childTabsBase = computed(() => `${this.portalRoute()}/${this.studentId}`);

  ngOnInit(): void {
    this.loadReportCards();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadReportCards();
  }

  private loadReportCards(): void {
    this.loading.set(true);
    this.error.set(null);

    this.portalService.listChildReportCards(this.studentId, this.query()).subscribe({
      next: (res) => {
        this.reportCards.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('PARENT_PORTAL.LOAD_REPORT_CARDS_ERROR');
        this.loading.set(false);
      },
    });
  }
}
