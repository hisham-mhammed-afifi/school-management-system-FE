import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { FeeInvoiceService } from '@core/services/fee-invoice.service';
import { PermissionService } from '@core/services/permission.service';
import type { FeeInvoice, InvoiceStatus, ListFeeInvoicesQuery } from '@core/models/fee-invoice';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-fee-invoices',
  imports: [
    RouterLink,
    TranslatePipe,
    PaginationComponent,
    IconComponent,
    DatePipe,
    DecimalPipe,
    NgClass,
  ],
  templateUrl: './fee-invoices.html',
  styleUrl: './fee-invoices.css',
})
export class FeeInvoicesComponent implements OnInit {
  private readonly feeInvoiceService = inject(FeeInvoiceService);
  readonly permissionService = inject(PermissionService);

  readonly invoices = signal<FeeInvoice[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListFeeInvoicesQuery>({ page: 1, limit: 20 });

  readonly statuses: InvoiceStatus[] = [
    'draft',
    'issued',
    'partially_paid',
    'paid',
    'overdue',
    'cancelled',
  ];

  ngOnInit(): void {
    this.loadInvoices();
  }

  onFilterStatus(event: Event): void {
    const value = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({
      ...q,
      page: 1,
      status: (value as InvoiceStatus) || undefined,
    }));
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

    this.feeInvoiceService.list(this.query()).subscribe({
      next: (res) => {
        this.invoices.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('FEE_INVOICES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
