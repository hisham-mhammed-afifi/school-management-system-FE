import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { DatePipe, DecimalPipe, NgClass } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { FeeInvoiceService } from '@core/services/fee-invoice.service';
import { PermissionService } from '@core/services/permission.service';
import { FeePaymentService } from '@core/services/fee-payment.service';
import { SchoolService } from '@core/services/school.service';
import type { FeeInvoice } from '@core/models/fee-invoice';
import type { FeePayment, PaymentMethod } from '@core/models/fee-payment';

@Component({
  selector: 'app-fee-invoice-detail',
  imports: [
    RouterLink,
    TranslatePipe,
    IconComponent,
    DatePipe,
    DecimalPipe,
    NgClass,
    ReactiveFormsModule,
  ],
  templateUrl: './fee-invoice-detail.html',
  styleUrl: './fee-invoice-detail.css',
})
export class FeeInvoiceDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly fb = inject(FormBuilder);
  private readonly feeInvoiceService = inject(FeeInvoiceService);
  private readonly feePaymentService = inject(FeePaymentService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/fee-invoices`,
  );
  readonly invoice = signal<FeeInvoice | null>(null);
  readonly payments = signal<FeePayment[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  readonly showIssueModal = signal(false);
  readonly issuing = signal(false);
  readonly notifyGuardian = signal(false);

  readonly showCancelModal = signal(false);
  readonly cancelling = signal(false);
  readonly cancelReason = signal('');

  readonly showPaymentModal = signal(false);
  readonly savingPayment = signal(false);

  readonly paymentMethods: PaymentMethod[] = ['cash', 'bank_transfer', 'card', 'cheque', 'online'];

  readonly paymentForm = this.fb.nonNullable.group({
    amountPaid: [0, [Validators.required, Validators.min(0.01)]],
    paymentDate: ['', [Validators.required]],
    paymentMethod: ['cash' as string, [Validators.required]],
    referenceNumber: [''],
    notes: [''],
  });

  private get invoiceId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadInvoice();
    this.loadPayments();
  }

  statusClass(status: string): string {
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
      default:
        return '';
    }
  }

  openIssueModal(): void {
    this.showIssueModal.set(true);
  }

  closeIssueModal(): void {
    this.showIssueModal.set(false);
  }

  issueInvoice(): void {
    this.issuing.set(true);
    this.feeInvoiceService.issue(this.invoiceId, this.notifyGuardian()).subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.issuing.set(false);
        this.showIssueModal.set(false);
      },
      error: () => {
        this.issuing.set(false);
        this.showIssueModal.set(false);
      },
    });
  }

  openCancelModal(): void {
    this.showCancelModal.set(true);
  }

  closeCancelModal(): void {
    this.showCancelModal.set(false);
  }

  cancelInvoice(): void {
    this.cancelling.set(true);
    this.feeInvoiceService.cancel(this.invoiceId, this.cancelReason()).subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.cancelling.set(false);
        this.showCancelModal.set(false);
      },
      error: () => {
        this.cancelling.set(false);
        this.showCancelModal.set(false);
      },
    });
  }

  openPaymentModal(): void {
    const inv = this.invoice();
    const balance = inv ? inv.netAmount - inv.paidAmount : 0;
    this.paymentForm.reset({
      amountPaid: balance > 0 ? balance : 0,
      paymentDate: new Date().toISOString().slice(0, 10),
      paymentMethod: 'cash',
      referenceNumber: '',
      notes: '',
    });
    this.showPaymentModal.set(true);
  }

  closePaymentModal(): void {
    this.showPaymentModal.set(false);
  }

  submitPayment(): void {
    if (this.paymentForm.invalid) {
      this.paymentForm.markAllAsTouched();
      return;
    }

    this.savingPayment.set(true);
    const val = this.paymentForm.getRawValue();
    this.feePaymentService
      .create({
        invoiceId: this.invoiceId,
        amountPaid: val.amountPaid,
        paymentDate: val.paymentDate,
        paymentMethod: val.paymentMethod as PaymentMethod,
        referenceNumber: val.referenceNumber || undefined,
        notes: val.notes || undefined,
      })
      .subscribe({
        next: (res) => {
          this.payments.update((list) => [...list, res.data]);
          this.savingPayment.set(false);
          this.showPaymentModal.set(false);
          this.loadInvoice();
        },
        error: () => {
          this.savingPayment.set(false);
        },
      });
  }

  private loadInvoice(): void {
    this.loading.set(true);
    this.error.set(null);
    this.feeInvoiceService.get(this.invoiceId).subscribe({
      next: (res) => {
        this.invoice.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('FEE_INVOICES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private loadPayments(): void {
    this.feePaymentService.list({ invoiceId: this.invoiceId, limit: 100 }).subscribe({
      next: (res) => this.payments.set(res.data),
    });
  }
}
