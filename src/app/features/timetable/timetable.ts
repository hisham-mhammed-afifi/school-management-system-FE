import { Component, inject, signal, OnInit } from '@angular/core';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { AcademicYearService } from '@core/services/academic-year.service';
import { TermService } from '@core/services/term.service';
import { TimetableService } from '@core/services/timetable.service';
import { ClassSectionService } from '@core/services/class-section.service';
import { TeacherService } from '@core/services/teacher.service';
import { RoomService } from '@core/services/room.service';

import type { AcademicYear } from '@core/models/academic-year';
import type { Term } from '@core/models/term';
import type {
  PeriodSet,
  Period,
  WorkingDay,
  TimetableGrid,
  TimetableViewType,
} from '@core/models/timetable';
import type { ClassSection } from '@core/models/class-section';
import type { Teacher } from '@core/models/teacher';
import type { Room } from '@core/models/room';

interface EntityOption {
  id: string;
  label: string;
}

@Component({
  selector: 'app-timetable',
  imports: [TranslatePipe, IconComponent],
  templateUrl: './timetable.html',
  styleUrl: './timetable.css',
})
export class TimetableComponent implements OnInit {
  private readonly academicYearService = inject(AcademicYearService);
  private readonly termService = inject(TermService);
  private readonly timetableService = inject(TimetableService);
  private readonly classSectionService = inject(ClassSectionService);
  private readonly teacherService = inject(TeacherService);
  private readonly roomService = inject(RoomService);

  readonly academicYears = signal<AcademicYear[]>([]);
  readonly terms = signal<Term[]>([]);
  readonly periodSets = signal<PeriodSet[]>([]);
  readonly periods = signal<Period[]>([]);
  readonly workingDays = signal<WorkingDay[]>([]);
  readonly entities = signal<EntityOption[]>([]);

  readonly selectedYearId = signal('');
  readonly selectedTermId = signal('');
  readonly selectedPeriodSetId = signal('');
  readonly selectedViewType = signal<TimetableViewType>('class');
  readonly selectedEntityId = signal('');

  readonly grid = signal<TimetableGrid>({});
  readonly entityName = signal('');
  readonly loading = signal(false);
  readonly error = signal<string | null>(null);

  ngOnInit(): void {
    this.loadAcademicYears();
  }

  onYearChange(event: Event): void {
    const yearId = (event.target as HTMLSelectElement).value;
    this.selectedYearId.set(yearId);
    this.selectedTermId.set('');
    this.selectedPeriodSetId.set('');
    this.selectedEntityId.set('');
    this.terms.set([]);
    this.periodSets.set([]);
    this.periods.set([]);
    this.workingDays.set([]);
    this.grid.set({});
    this.entityName.set('');

    if (yearId) {
      this.loadTerms(yearId);
      this.loadPeriodSets(yearId);
    }
  }

  onTermChange(event: Event): void {
    const termId = (event.target as HTMLSelectElement).value;
    this.selectedTermId.set(termId);
    this.selectedEntityId.set('');
    this.grid.set({});
    this.entityName.set('');
  }

  onPeriodSetChange(event: Event): void {
    const periodSetId = (event.target as HTMLSelectElement).value;
    this.selectedPeriodSetId.set(periodSetId);
    this.periods.set([]);
    this.workingDays.set([]);
    this.grid.set({});

    if (periodSetId) {
      this.loadPeriodSetData(periodSetId);
    }
  }

  onViewTypeChange(viewType: TimetableViewType): void {
    this.selectedViewType.set(viewType);
    this.selectedEntityId.set('');
    this.entities.set([]);
    this.grid.set({});
    this.entityName.set('');
    this.loadEntities(viewType);
  }

  onEntityChange(event: Event): void {
    const entityId = (event.target as HTMLSelectElement).value;
    this.selectedEntityId.set(entityId);
    this.grid.set({});
    this.entityName.set('');

    if (entityId && this.selectedTermId()) {
      this.loadTimetable();
    }
  }

  get activeDays(): WorkingDay[] {
    return this.workingDays()
      .filter((d) => d.isActive)
      .sort((a, b) => a.dayOfWeek - b.dayOfWeek);
  }

  get sortedPeriods(): Period[] {
    return [...this.periods()].sort((a, b) => a.orderIndex - b.orderIndex);
  }

  getCellLesson(
    dayOfWeek: number,
    periodId: string,
  ): { subject: string; teacher: string; room: string } | null {
    const g = this.grid();
    const dayData = g[String(dayOfWeek)];
    if (!dayData) return null;
    return dayData[periodId] ?? null;
  }

  private loadAcademicYears(): void {
    this.academicYearService.list({ limit: 100 }).subscribe({
      next: (res) => this.academicYears.set(res.data),
    });
  }

  private loadTerms(academicYearId: string): void {
    this.termService.listByYear(academicYearId).subscribe({
      next: (res) => this.terms.set(res.data),
    });
  }

  private loadPeriodSets(academicYearId: string): void {
    this.timetableService.listPeriodSets({ academicYearId, limit: 100 }).subscribe({
      next: (res) => this.periodSets.set(res.data),
    });
  }

  private loadPeriodSetData(periodSetId: string): void {
    this.timetableService.getPeriods(periodSetId).subscribe({
      next: (res) => this.periods.set(res.data),
    });
    this.timetableService.getWorkingDays(periodSetId).subscribe({
      next: (res) => this.workingDays.set(res.data),
    });
  }

  private loadEntities(viewType: TimetableViewType): void {
    switch (viewType) {
      case 'class':
        this.classSectionService
          .list({ limit: 200, academicYearId: this.selectedYearId() || undefined })
          .subscribe({
            next: (res) =>
              this.entities.set(res.data.map((s: ClassSection) => ({ id: s.id, label: s.name }))),
          });
        break;
      case 'teacher':
        this.teacherService.list({ limit: 200, status: 'active' }).subscribe({
          next: (res) =>
            this.entities.set(
              res.data.map((t: Teacher) => ({ id: t.id, label: `${t.firstName} ${t.lastName}` })),
            ),
        });
        break;
      case 'room':
        this.roomService.list({ limit: 200 }).subscribe({
          next: (res) =>
            this.entities.set(res.data.map((r: Room) => ({ id: r.id, label: r.name }))),
        });
        break;
    }
  }

  private loadTimetable(): void {
    this.loading.set(true);
    this.error.set(null);

    const entityId = this.selectedEntityId();
    const termId = this.selectedTermId();
    const viewType = this.selectedViewType();

    const onError = (): void => {
      this.error.set('TIMETABLE.LOAD_ERROR');
      this.loading.set(false);
    };

    switch (viewType) {
      case 'class':
        this.timetableService.getClassTimetable(entityId, termId).subscribe({
          next: (res) => {
            this.grid.set(res.data.grid);
            this.entityName.set(res.data.classSectionName);
            this.loading.set(false);
          },
          error: onError,
        });
        break;
      case 'teacher':
        this.timetableService.getTeacherTimetable(entityId, termId).subscribe({
          next: (res) => {
            this.grid.set(res.data.grid);
            this.entityName.set(res.data.teacherName);
            this.loading.set(false);
          },
          error: onError,
        });
        break;
      case 'room':
        this.timetableService.getRoomTimetable(entityId, termId).subscribe({
          next: (res) => {
            this.grid.set(res.data.grid);
            this.entityName.set(res.data.roomName);
            this.loading.set(false);
          },
          error: onError,
        });
        break;
    }
  }
}
