import { Component, computed, inject, signal, OnInit } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { ReportCardService } from '@core/services/report-card.service';
import { SchoolService } from '@core/services/school.service';
import type { ReportCard, SubjectSnapshot } from '@core/models/report-card';

@Component({
  selector: 'app-report-card-detail',
  imports: [RouterLink, TranslatePipe, IconComponent, DatePipe, DecimalPipe],
  templateUrl: './report-card-detail.html',
  styleUrl: './report-card-detail.css',
})
export class ReportCardDetailComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly reportCardService = inject(ReportCardService);
  private readonly schoolService = inject(SchoolService);

  readonly listRoute = computed(
    () => `/schools/${this.schoolService.currentSchoolId()}/report-cards`,
  );
  readonly reportCard = signal<ReportCard | null>(null);
  readonly subjects = computed<SubjectSnapshot[]>(
    () => this.reportCard()?.snapshotData?.subjects ?? [],
  );
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  // Remarks editing
  readonly editingRemarks = signal(false);
  readonly remarksValue = signal('');
  readonly savingRemarks = signal(false);
  readonly remarksSaved = signal(false);

  private get cardId(): string {
    return this.route.snapshot.paramMap.get('id')!;
  }

  ngOnInit(): void {
    this.loadReportCard();
  }

  startEditRemarks(): void {
    this.remarksValue.set(this.reportCard()?.teacherRemarks ?? '');
    this.editingRemarks.set(true);
    this.remarksSaved.set(false);
  }

  cancelEditRemarks(): void {
    this.editingRemarks.set(false);
  }

  onRemarksChange(event: Event): void {
    this.remarksValue.set((event.target as HTMLTextAreaElement).value);
  }

  saveRemarks(): void {
    this.savingRemarks.set(true);
    this.reportCardService
      .updateRemarks(this.cardId, { teacherRemarks: this.remarksValue() })
      .subscribe({
        next: (res) => {
          this.reportCard.set(res.data);
          this.savingRemarks.set(false);
          this.editingRemarks.set(false);
          this.remarksSaved.set(true);
        },
        error: () => {
          this.savingRemarks.set(false);
        },
      });
  }

  private loadReportCard(): void {
    this.loading.set(true);
    this.error.set(null);
    this.reportCardService.get(this.cardId).subscribe({
      next: (res) => {
        this.reportCard.set(res.data);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('REPORT_CARDS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
