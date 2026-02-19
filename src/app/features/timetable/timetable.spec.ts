import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TimetableComponent } from './timetable';

describe('TimetableComponent', () => {
  let fixture: ComponentFixture<TimetableComponent>;
  let component: TimetableComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TimetableComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TimetableComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const yearsReq = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    yearsReq.flush({
      success: true,
      data: [
        {
          id: 'year-1',
          name: '2025-2026',
          startDate: '2025-09-01',
          endDate: '2026-06-30',
          isActive: true,
          schoolId: 's-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitialRequests();
    expect(component).toBeTruthy();
  });

  it('should load academic years on init', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.academicYears().length).toBe(1);
  });

  it('should load terms and period sets when year is selected', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onYearChange({ target: { value: 'year-1' } } as unknown as Event);

    const termsReq = httpTesting.expectOne('/api/v1/academic-years/year-1/terms');
    termsReq.flush({
      success: true,
      data: [
        {
          id: 'term-1',
          name: 'Term 1',
          schoolId: 's-1',
          academicYearId: 'year-1',
          startDate: '2025-09-01',
          endDate: '2026-01-15',
          orderIndex: 1,
          createdAt: '',
          updatedAt: '',
        },
      ],
    });

    const psReq = httpTesting.expectOne((r) => r.url === '/api/v1/period-sets');
    expect(psReq.request.params.get('academicYearId')).toBe('year-1');
    psReq.flush({
      success: true,
      data: [
        {
          id: 'ps-1',
          name: 'Default',
          schoolId: 's-1',
          academicYearId: 'year-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    expect(component.selectedYearId()).toBe('year-1');
    expect(component.terms().length).toBe(1);
    expect(component.periodSets().length).toBe(1);
  });

  it('should load periods and working days when period set is selected', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.onPeriodSetChange({ target: { value: 'ps-1' } } as unknown as Event);

    const periodsReq = httpTesting.expectOne('/api/v1/period-sets/ps-1/periods');
    periodsReq.flush({
      success: true,
      data: [
        {
          id: 'p-1',
          schoolId: 's-1',
          periodSetId: 'ps-1',
          name: 'Period 1',
          startTime: '08:00',
          endTime: '08:45',
          orderIndex: 1,
          isBreak: false,
        },
      ],
    });

    const daysReq = httpTesting.expectOne('/api/v1/period-sets/ps-1/working-days');
    daysReq.flush({
      success: true,
      data: [
        { id: 'wd-1', schoolId: 's-1', periodSetId: 'ps-1', dayOfWeek: 0, isActive: true },
        { id: 'wd-2', schoolId: 's-1', periodSetId: 'ps-1', dayOfWeek: 1, isActive: true },
      ],
    });

    expect(component.selectedPeriodSetId()).toBe('ps-1');
    expect(component.periods().length).toBe(1);
    expect(component.workingDays().length).toBe(2);
  });

  it('should switch view type and load entities', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.onViewTypeChange('teacher');

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    req.flush({
      success: true,
      data: [
        {
          id: 't-1',
          teacherCode: 'T001',
          firstName: 'John',
          lastName: 'Doe',
          gender: 'male',
          nationalId: null,
          phone: null,
          email: null,
          specialization: null,
          qualification: null,
          photoUrl: null,
          hireDate: '2024-01-01',
          departmentId: null,
          status: 'active',
          schoolId: 's-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    expect(component.selectedViewType()).toBe('teacher');
    expect(component.entities().length).toBe(1);
    expect(component.entities()[0].label).toBe('John Doe');
  });

  it('should load class entities by default', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.onViewTypeChange('class');

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    req.flush({
      success: true,
      data: [
        {
          id: 'cs-1',
          academicYearId: 'year-1',
          gradeId: 'g-1',
          name: 'Section A',
          capacity: 30,
          homeroomTeacherId: null,
          schoolId: 's-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    expect(component.entities()[0].label).toBe('Section A');
  });

  it('should load room entities', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.onViewTypeChange('room');

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/rooms');
    req.flush({
      success: true,
      data: [
        {
          id: 'r-1',
          schoolId: 's-1',
          name: 'Room 101',
          building: null,
          floor: null,
          capacity: 30,
          roomType: 'classroom',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    expect(component.entities()[0].label).toBe('Room 101');
  });

  it('should load timetable when entity is selected', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.selectedTermId.set('term-1');
    component.selectedPeriodSetId.set('ps-1');
    component.selectedViewType.set('class');

    component.onEntityChange({ target: { value: 'cs-1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/timetable/class/cs-1');
    expect(req.request.params.get('termId')).toBe('term-1');
    req.flush({
      success: true,
      data: {
        termId: 'term-1',
        classSectionId: 'cs-1',
        classSectionName: 'Section A',
        grid: {
          '0': {
            'p-1': { lessonId: 'l-1', subject: 'Math', teacher: 'Mr. Smith', room: 'Room 101' },
          },
        },
      },
    });

    expect(component.loading()).toBe(false);
    expect(component.entityName()).toBe('Section A');
    expect(component.getCellLesson(0, 'p-1')).toEqual({
      lessonId: 'l-1',
      subject: 'Math',
      teacher: 'Mr. Smith',
      room: 'Room 101',
    });
  });

  it('should handle timetable load error', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedYearId.set('year-1');
    component.selectedTermId.set('term-1');
    component.selectedPeriodSetId.set('ps-1');
    component.selectedViewType.set('class');

    component.onEntityChange({ target: { value: 'cs-1' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/timetable/class/cs-1');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('TIMETABLE.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should return null for empty grid cells', () => {
    component.grid.set({ '0': { 'p-1': null } });
    expect(component.getCellLesson(0, 'p-1')).toBeNull();
    expect(component.getCellLesson(1, 'p-1')).toBeNull();
  });

  it('should filter active days and sort periods', () => {
    component.workingDays.set([
      { id: 'wd-1', schoolId: 's-1', periodSetId: 'ps-1', dayOfWeek: 2, isActive: true },
      { id: 'wd-2', schoolId: 's-1', periodSetId: 'ps-1', dayOfWeek: 0, isActive: true },
      { id: 'wd-3', schoolId: 's-1', periodSetId: 'ps-1', dayOfWeek: 5, isActive: false },
    ]);
    component.periods.set([
      {
        id: 'p-2',
        schoolId: 's-1',
        periodSetId: 'ps-1',
        name: 'Period 2',
        startTime: '09:00',
        endTime: '09:45',
        orderIndex: 2,
        isBreak: false,
      },
      {
        id: 'p-1',
        schoolId: 's-1',
        periodSetId: 'ps-1',
        name: 'Period 1',
        startTime: '08:00',
        endTime: '08:45',
        orderIndex: 1,
        isBreak: false,
      },
    ]);

    expect(component.activeDays.length).toBe(2);
    expect(component.activeDays[0].dayOfWeek).toBe(0);
    expect(component.activeDays[1].dayOfWeek).toBe(2);

    expect(component.sortedPeriods[0].name).toBe('Period 1');
    expect(component.sortedPeriods[1].name).toBe('Period 2');
  });

  it('should reset state when year changes', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.selectedTermId.set('term-1');
    component.selectedPeriodSetId.set('ps-1');
    component.selectedEntityId.set('cs-1');

    component.onYearChange({ target: { value: '' } } as unknown as Event);

    expect(component.selectedTermId()).toBe('');
    expect(component.selectedPeriodSetId()).toBe('');
    expect(component.selectedEntityId()).toBe('');
    expect(component.terms().length).toBe(0);
    expect(component.periodSets().length).toBe(0);
  });
});
