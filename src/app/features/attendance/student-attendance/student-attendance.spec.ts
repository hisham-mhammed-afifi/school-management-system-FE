import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { StudentAttendanceComponent } from './student-attendance';

describe('StudentAttendanceComponent', () => {
  let fixture: ComponentFixture<StudentAttendanceComponent>;
  let component: StudentAttendanceComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAttendanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(StudentAttendanceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushClassSections(): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    req.flush({
      success: true,
      data: [
        {
          id: 'cs-1',
          name: 'Section A',
          academicYearId: 'y-1',
          gradeId: 'g-1',
          capacity: 30,
          homeroomTeacherId: null,
          schoolId: 's-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  }

  function flushAttendanceData(): void {
    const enrollReq = httpTesting.expectOne((r) => r.url === '/api/v1/enrollments');
    enrollReq.flush({
      success: true,
      data: [
        {
          id: 'e-1',
          studentId: 's-1',
          classSectionId: 'cs-1',
          schoolId: 'sch-1',
          academicYearId: 'y-1',
          enrolledAt: '2025-09-01',
          withdrawnAt: null,
          status: 'active',
          notes: null,
          createdAt: '',
          updatedAt: '',
          student: {
            id: 's-1',
            studentCode: 'STU001',
            firstName: 'Ahmed',
            lastName: 'Ali',
          },
        },
        {
          id: 'e-2',
          studentId: 's-2',
          classSectionId: 'cs-1',
          schoolId: 'sch-1',
          academicYearId: 'y-1',
          enrolledAt: '2025-09-01',
          withdrawnAt: null,
          status: 'active',
          notes: null,
          createdAt: '',
          updatedAt: '',
          student: {
            id: 's-2',
            studentCode: 'STU002',
            firstName: 'Sara',
            lastName: 'Hassan',
          },
        },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    const attReq = httpTesting.expectOne((r) => r.url === '/api/v1/student-attendance');
    attReq.flush({
      success: true,
      data: [
        {
          id: 'att-1',
          studentId: 's-1',
          classSectionId: 'cs-1',
          date: '2026-02-19',
          status: 'late',
          notes: 'Arrived 10 min late',
          schoolId: 'sch-1',
          lessonId: null,
          recordedBy: 'u-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushClassSections();
    expect(component).toBeTruthy();
  });

  it('should load class sections on init', () => {
    fixture.detectChanges();
    flushClassSections();

    expect(component.classSections().length).toBe(1);
    expect(component.classSections()[0].name).toBe('Section A');
  });

  it('should set today as default date', () => {
    fixture.detectChanges();
    flushClassSections();

    const today = new Date().toISOString().slice(0, 10);
    expect(component.selectedDate()).toBe(today);
  });

  it('should load attendance when class and date are selected', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    expect(component.rows().length).toBe(2);
    expect(component.rows()[0].studentCode).toBe('STU001');
    expect(component.rows()[0].status).toBe('late');
    expect(component.rows()[0].notes).toBe('Arrived 10 min late');
    expect(component.rows()[0].existingId).toBe('att-1');
    expect(component.rows()[1].status).toBe('present');
    expect(component.rows()[1].existingId).toBeNull();
  });

  it('should update row status', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.onStatusChange(1, { target: { value: 'absent' } } as unknown as Event);

    expect(component.rows()[1].status).toBe('absent');
  });

  it('should update row notes', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.onNotesChange(0, { target: { value: 'Sick' } } as unknown as Event);

    expect(component.rows()[0].notes).toBe('Sick');
  });

  it('should mark all students with a status', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.markAll({ target: { value: 'absent' } } as unknown as Event);

    expect(component.rows()[0].status).toBe('absent');
    expect(component.rows()[1].status).toBe('absent');
  });

  it('should not mark all when value is empty', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.markAll({ target: { value: '' } } as unknown as Event);

    expect(component.rows()[0].status).toBe('late');
  });

  it('should save attendance', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.save();

    const req = httpTesting.expectOne('/api/v1/student-attendance/bulk');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.classSectionId).toBe('cs-1');
    expect(req.request.body.records.length).toBe(2);
    req.flush({ success: true, data: [] });

    expect(component.saved()).toBe(true);
    expect(component.saving()).toBe(false);
  });

  it('should handle save error', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    component.save();

    const req = httpTesting.expectOne('/api/v1/student-attendance/bulk');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('ATTENDANCE.SAVE_ERROR');
    expect(component.saving()).toBe(false);
  });

  it('should handle enrollment load error', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);

    const enrollReq = httpTesting.expectOne((r) => r.url === '/api/v1/enrollments');
    enrollReq.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('ATTENDANCE.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should clear rows when class is deselected', () => {
    fixture.detectChanges();
    flushClassSections();

    component.onClassChange({ target: { value: 'cs-1' } } as unknown as Event);
    flushAttendanceData();

    expect(component.rows().length).toBe(2);

    component.onClassChange({ target: { value: '' } } as unknown as Event);

    expect(component.rows().length).toBe(0);
  });

  it('should not save when no rows exist', () => {
    fixture.detectChanges();
    flushClassSections();

    component.selectedClassId.set('cs-1');
    component.save();

    // No HTTP requests should be made
    expect(component.saving()).toBe(false);
  });
});
