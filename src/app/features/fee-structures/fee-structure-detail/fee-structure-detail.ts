import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { FeeStructureService } from '@core/services/fee-structure.service';
import { PermissionService } from '@core/services/permission.service';
import { FeeDiscountService } from '@core/services/fee-discount.service';
import { SchoolService } from '@core/services/school.service';
import type { FeeStructure } from '@core/models/fee-structure';
import type { FeeDiscount } from '@core/models/fee-discount';

@Component({
  selector: 'app-fee-structure-detail',
  imports: [RouterLink, TranslatePipe, IconComponent, DatePipe, DecimalPipe],
  templateUrl: './fee-structure-detail.html',
  styleUrl: './fee-structure-detail.css',
})
export class FeeStructureDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly feeStructureService = inject(FeeStructureService);
  private readonly feeDiscountService = inject(FeeDiscountService);
  private readonly schoolService = inject(SchoolService);
  readonly permissionService = inject(PermissionService);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/fee-structures`,
  );
  readonly structure = signal<FeeStructure | null>(null);
  readonly discounts = signal<FeeDiscount[]>([]);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);
  readonly showDeleteDiscountConfirm = signal<string | null>(null);
  readonly deletingDiscount = signal(false);

  private get structureId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadStructure();
    this.loadDiscounts();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteStructure(): void {
    this.deleting.set(true);
    this.feeStructureService.delete(this.structureId).subscribe({
      next: () => {
        this.router.navigate([this.listRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  confirmDeleteDiscount(id: string): void {
    this.showDeleteDiscountConfirm.set(id);
  }

  cancelDeleteDiscount(): void {
    this.showDeleteDiscountConfirm.set(null);
  }

  deleteDiscount(): void {
    const discountId = this.showDeleteDiscountConfirm();
    if (!discountId) return;

    this.deletingDiscount.set(true);
    this.feeDiscountService.delete(discountId).subscribe({
      next: () => {
        this.discounts.update((list) => list.filter((d) => d.id !== discountId));
        this.deletingDiscount.set(false);
        this.showDeleteDiscountConfirm.set(null);
      },
      error: () => {
        this.deletingDiscount.set(false);
        this.showDeleteDiscountConfirm.set(null);
      },
    });
  }

  private loadStructure(): void {
    this.loading.set(true);
    this.error.set(null);
    this.feeStructureService.get(this.structureId).subscribe({
      next: (res) => {
        this.structure.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('FEE_STRUCTURES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }

  private loadDiscounts(): void {
    this.feeDiscountService.list({ feeStructureId: this.structureId, limit: 100 }).subscribe({
      next: (res) => this.discounts.set(res.data),
    });
  }
}
