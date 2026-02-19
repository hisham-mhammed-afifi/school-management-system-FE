import { Component, computed, inject, signal, OnInit } from '@angular/core';
import {
  ReactiveFormsModule,
  FormBuilder,
  FormArray,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { FeeInvoiceService } from '@core/services/fee-invoice.service';
import { StudentService } from '@core/services/student.service';
import { FeeStructureService } from '@core/services/fee-structure.service';
import { SchoolService } from '@core/services/school.service';
import type { Student } from '@core/models/student';
import type { FeeStructure } from '@core/models/fee-structure';
import type { ApiErrorResponse } from '@core/models/api';

interface InvoiceItemFormControls {
  feeStructureId: FormControl<string>;
  description: FormControl<string>;
  quantity: FormControl<number>;
  unitAmount: FormControl<number>;
}

@Component({
  selector: 'app-fee-invoice-form',
  imports: [ReactiveFormsModule, TranslatePipe, RouterLink, IconComponent],
  templateUrl: './fee-invoice-form.html',
  styleUrl: './fee-invoice-form.css',
})
export class FeeInvoiceFormComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly feeInvoiceService = inject(FeeInvoiceService);
  private readonly studentService = inject(StudentService);
  private readonly feeStructureService = inject(FeeStructureService);
  private readonly schoolService = inject(SchoolService);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/fee-invoices`,
  );
  readonly saving = signal(false);
  readonly errorMessage = signal<string | null>(null);

  readonly students = signal<Student[]>([]);
  readonly feeStructures = signal<FeeStructure[]>([]);

  readonly form = this.fb.nonNullable.group({
    studentId: ['', [Validators.required]],
    dueDate: ['', [Validators.required]],
    items: this.fb.array<FormGroup<InvoiceItemFormControls>>([]),
  });

  get items(): FormArray<FormGroup<InvoiceItemFormControls>> {
    return this.form.controls.items;
  }

  ngOnInit(): void {
    this.loadDropdowns();
    this.addItem();
  }

  addItem(): void {
    this.items.push(this.createItemGroup());
  }

  removeItem(index: number): void {
    this.items.removeAt(index);
  }

  onFeeStructureChange(index: number): void {
    const group = this.items.at(index);
    const fsId = group.controls.feeStructureId.value;
    const fs = this.feeStructures().find((s) => s.id === fsId);
    if (fs) {
      group.controls.unitAmount.setValue(fs.amount);
    }
  }

  onSubmit(): void {
    if (this.form.invalid || this.items.length === 0) {
      this.form.markAllAsTouched();
      return;
    }

    this.saving.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.getRawValue();
    this.feeInvoiceService
      .create({
        studentId: formVal.studentId,
        dueDate: formVal.dueDate,
        items: formVal.items.map((item) => ({
          feeStructureId: item.feeStructureId,
          description: item.description || undefined,
          quantity: item.quantity,
          unitAmount: item.unitAmount,
        })),
      })
      .subscribe({
        next: (res) =>
          this.router.navigate([
            '/schools',
            this.schoolService.currentSchoolId(),
            'fee-invoices',
            res.data.id,
          ]),
        error: (err) => this.handleError(err),
      });
  }

  private createItemGroup(): FormGroup<InvoiceItemFormControls> {
    return this.fb.nonNullable.group({
      feeStructureId: ['', [Validators.required]],
      description: [''],
      quantity: [1, [Validators.required, Validators.min(1)]],
      unitAmount: [0, [Validators.required, Validators.min(0)]],
    });
  }

  private loadDropdowns(): void {
    this.studentService.list({ limit: 100, status: 'active' }).subscribe({
      next: (res) => this.students.set(res.data),
    });
    this.feeStructureService.list({ limit: 100 }).subscribe({
      next: (res) => this.feeStructures.set(res.data),
    });
  }

  private handleError(err: { error?: ApiErrorResponse }): void {
    this.saving.set(false);
    const body = err.error;
    this.errorMessage.set(body?.error?.message ?? 'COMMON.ERROR');
  }
}
