import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { GradingScaleService } from '@core/services/grading-scale.service';
import { PermissionService } from '@core/services/permission.service';
import type { GradingScale, ListGradingScalesQuery } from '@core/models/grading-scale';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-grading-scales',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent],
  templateUrl: './grading-scales.html',
  styleUrl: './grading-scales.css',
})
export class GradingScalesComponent implements OnInit {
  private readonly gradingScaleService = inject(GradingScaleService);
  readonly permissionService = inject(PermissionService);

  readonly scales = signal<GradingScale[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 10, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListGradingScalesQuery>({ page: 1, limit: 10 });

  ngOnInit(): void {
    this.loadScales();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadScales();
  }

  private loadScales(): void {
    this.loading.set(true);
    this.error.set(null);

    this.gradingScaleService.list(this.query()).subscribe({
      next: (res) => {
        this.scales.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('GRADING_SCALES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
