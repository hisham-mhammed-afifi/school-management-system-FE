import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { CdkTrapFocus, LiveAnnouncer } from '@angular/cdk/a11y';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { GradingScaleService } from '@core/services/grading-scale.service';
import { PermissionService } from '@core/services/permission.service';
import { SchoolService } from '@core/services/school.service';
import type { GradingScale } from '@core/models/grading-scale';

@Component({
  selector: 'app-grading-scale-detail',
  imports: [RouterLink, TranslatePipe, IconComponent, CdkTrapFocus],
  templateUrl: './grading-scale-detail.html',
  styleUrl: './grading-scale-detail.css',
})
export class GradingScaleDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly gradingScaleService = inject(GradingScaleService);
  private readonly schoolService = inject(SchoolService);
  private readonly liveAnnouncer = inject(LiveAnnouncer);
  private readonly translate = inject(TranslateService);
  readonly permissionService = inject(PermissionService);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/grading-scales`,
  );
  readonly scale = signal<GradingScale | null>(null);
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly deleting = signal(false);
  readonly showDeleteConfirm = signal(false);

  private get scaleId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadScale();
  }

  confirmDelete(): void {
    this.showDeleteConfirm.set(true);
  }

  cancelDelete(): void {
    this.showDeleteConfirm.set(false);
  }

  deleteScale(): void {
    this.deleting.set(true);
    this.gradingScaleService.delete(this.scaleId).subscribe({
      next: () => {
        this.liveAnnouncer.announce(this.translate.instant('COMMON.SUCCESS'), 'polite');
        this.router.navigate([this.listRoute()]);
      },
      error: () => {
        this.deleting.set(false);
        this.showDeleteConfirm.set(false);
      },
    });
  }

  private loadScale(): void {
    this.loading.set(true);
    this.error.set(null);
    this.gradingScaleService.get(this.scaleId).subscribe({
      next: (res) => {
        this.scale.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('GRADING_SCALES.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
