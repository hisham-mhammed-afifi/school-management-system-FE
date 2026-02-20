import { Component, inject, signal, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';
import { PaginationComponent } from '@shared/components/pagination/pagination';

import { ReportCardService } from '@core/services/report-card.service';
import { AcademicYearService } from '@core/services/academic-year.service';
import { TermService } from '@core/services/term.service';
import { ClassSectionService } from '@core/services/class-section.service';
import type {
  ReportCard,
  ListReportCardsQuery,
  GenerateReportCardsResponse,
} from '@core/models/report-card';
import type { AcademicYear } from '@core/models/academic-year';
import type { Term } from '@core/models/term';
import type { ClassSection } from '@core/models/class-section';
import type { PaginationMeta } from '@core/models/api';

@Component({
  selector: 'app-report-cards',
  imports: [RouterLink, TranslatePipe, PaginationComponent, IconComponent, DecimalPipe],
  templateUrl: './report-cards.html',
  styleUrl: './report-cards.css',
})
export class ReportCardsComponent implements OnInit {
  private readonly reportCardService = inject(ReportCardService);
  private readonly academicYearService = inject(AcademicYearService);
  private readonly termService = inject(TermService);
  private readonly classSectionService = inject(ClassSectionService);

  readonly reportCards = signal<ReportCard[]>([]);
  readonly meta = signal<PaginationMeta>({ page: 1, limit: 20, total: 0, totalPages: 0 });
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);
  readonly query = signal<ListReportCardsQuery>({ page: 1, limit: 20 });

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly classSections = signal<ClassSection[]>([]);

  // Generate modal
  readonly showGenerate = signal(false);
  readonly generating = signal(false);
  readonly generateTermId = signal('');
  readonly generateClassId = signal('');
  readonly generateResult = signal<GenerateReportCardsResponse | null>(null);
  readonly generateError = signal<string | null>(null);

  // Filter
  readonly filterYearId = signal('');

  ngOnInit(): void {
    this.loadDropdowns();
    this.loadReportCards();
  }

  onYearFilterChange(event: Event): void {
    const yearId = (event.target as HTMLSelectElement).value;
    this.filterYearId.set(yearId);
    this.terms.set([]);

    if (yearId) {
      this.termService.listByYear(yearId).subscribe({
        next: (res) => this.terms.set(res.data),
      });
    }
  }

  onTermFilterChange(event: Event): void {
    const termId = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, termId: termId || undefined, page: 1 }));
    this.loadReportCards();
  }

  onClassFilterChange(event: Event): void {
    const csId = (event.target as HTMLSelectElement).value;
    this.query.update((q) => ({ ...q, classSectionId: csId || undefined, page: 1 }));
    this.loadReportCards();
  }

  onPageChange(page: number): void {
    this.query.update((q) => ({ ...q, page }));
    this.loadReportCards();
  }

  openGenerate(): void {
    this.generateTermId.set('');
    this.generateClassId.set('');
    this.generateResult.set(null);
    this.generateError.set(null);
    this.showGenerate.set(true);
  }

  closeGenerate(): void {
    this.showGenerate.set(false);
    if (this.generateResult()) {
      this.loadReportCards();
    }
  }

  submitGenerate(): void {
    const termId = this.generateTermId();
    const classId = this.generateClassId();
    if (!termId || !classId) return;

    this.generating.set(true);
    this.generateError.set(null);
    this.generateResult.set(null);

    this.reportCardService.generate({ termId, classSectionId: classId }).subscribe({
      next: (res) => {
        this.generateResult.set(res.data);
        this.generating.set(false);
      },
      error: () => {
        this.generateError.set('REPORT_CARDS.GENERATE_ERROR');
        this.generating.set(false);
      },
    });
  }

  onGenerateYearChange(event: Event): void {
    const yearId = (event.target as HTMLSelectElement).value;
    this.generateTermId.set('');

    if (yearId) {
      this.termService.listByYear(yearId).subscribe({
        next: (res) => this.terms.set(res.data),
      });
    } else {
      this.terms.set([]);
    }
  }

  onGenerateTermChange(event: Event): void {
    this.generateTermId.set((event.target as HTMLSelectElement).value);
  }

  onGenerateClassChange(event: Event): void {
    this.generateClassId.set((event.target as HTMLSelectElement).value);
  }

  private loadDropdowns(): void {
    this.academicYearService.list({ limit: 100 }).subscribe({
      next: (res) => this.academicYears.set(res.data),
    });
    this.classSectionService.list({ limit: 100 }).subscribe({
      next: (res) => this.classSections.set(res.data),
    });
  }

  private loadReportCards(): void {
    this.loading.set(true);
    this.error.set(null);

    this.reportCardService.list(this.query()).subscribe({
      next: (res) => {
        this.reportCards.set(res.data);
        this.meta.set(res.meta);
        this.loading.set(false);
      },
      error: () => {
        this.error.set('REPORT_CARDS.LOAD_ERROR');
        this.loading.set(false);
      },
    });
  }
}
