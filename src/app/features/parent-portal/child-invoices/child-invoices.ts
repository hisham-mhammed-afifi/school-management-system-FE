import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink, RouterLinkActive } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { GuardianPortalService } from '@core/services/guardian-portal.service';
import { SchoolService } from '@core/services/school.service';
import type { FeeInvoice, InvoiceStatus } from '@core/models/fee-invoice';
import type { ChildPaginationQuery } from '@core/models/guardian';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-child-invoices',
  imports: [
    RouterLink,
    RouterLinkActive,
    TranslatePipe,
    IconComponent,
    PaginationComponent,
    DatePipe,
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './child-invoices.html',
  styleUrl: './child-invoices.css',
})
export class ChildInvoicesComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly portalService = inject(GuardianPortalService);
  private readonly schoolService = inject(SchoolService);

  readonly portalRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/parent-portal`,
  );

  readonly invoices = signal<FeeInvoice[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ChildPaginationQuery>({ page: 1, limit: 20 });

  private get studentId(): string {
    return this.route.snapshot.paramMap.get('studentId')!;
  }

  readonly childTabsBase = computed(() => `${this.portalRoute()}/${this.studentId}`);

  ngOnInit(): void {
    this.loadInvoices();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadInvoices();
  }

  statusClass(status: InvoiceStatus): string {
    switch (status) {
      case 'draft':
        return 'bg-bg-secondary text-text-secondary';
      case 'issued':
        return 'bg-info-bg text-info-text';
      case 'partially_paid':
        return 'bg-warning-bg text-warning-text';
      case 'paid':
        return 'bg-success-bg text-success-text';
      case 'overdue':
        return 'bg-danger-bg text-danger-text';
      case 'cancelled':
        return 'bg-bg-secondary text-text-tertiary';
    }
  }

  private loadInvoices(): void {
    this.loading.set(true);
    this.error.set(null);

    this.portalService.listChildInvoices(this.studentId, this.query()).subscribe({
      next: (res) => {
        this.invoices.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('PARENT_PORTAL.LOAD_INVOICES_ERROR');
        this.loading.set(false);
      },
    });
  }
}
