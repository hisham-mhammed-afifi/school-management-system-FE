import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { TeacherAttendanceComponent } from './teacher-attendance';

describe('TeacherAttendanceComponent', () => {
  let fixture: ComponentFixture<TeacherAttendanceComponent>;
  let component: TeacherAttendanceComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [TeacherAttendanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(TeacherAttendanceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitialRequests(): void {
    const teacherReq = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    teacherReq.flush({
      success: true,
      data: [
        {
          id: 't-1',
          teacherCode: 'TCH001',
          firstName: 'Omar',
          lastName: 'Khalid',
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
        {
          id: 't-2',
          teacherCode: 'TCH002',
          firstName: 'Fatima',
          lastName: 'Ali',
          gender: 'female',
          nationalId: null,
          phone: null,
          email: null,
          specialization: null,
          qualification: null,
          photoUrl: null,
          hireDate: '2024-06-01',
          departmentId: null,
          status: 'active',
          schoolId: 's-1',
          createdAt: '',
          updatedAt: '',
        },
      ],
      meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
    });

    const attReq = httpTesting.expectOne((r) => r.url === '/api/v1/teacher-attendance');
    attReq.flush({
      success: true,
      data: [
        {
          id: 'ta-1',
          teacherId: 't-1',
          date: '2026-02-19',
          status: 'present',
          checkIn: '08:00',
          checkOut: null,
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

  it('should set today as default date and load data', () => {
    fixture.detectChanges();
    flushInitialRequests();

    const today = new Date().toISOString().slice(0, 10);
    expect(component.selectedDate()).toBe(today);
    expect(component.rows().length).toBe(2);
  });

  it('should merge existing attendance with teacher list', () => {
    fixture.detectChanges();
    flushInitialRequests();

    expect(component.rows()[0].teacherCode).toBe('TCH001');
    expect(component.rows()[0].status).toBe('present');
    expect(component.rows()[0].checkIn).toBe('08:00');
    expect(component.rows()[0].existingId).toBe('ta-1');

    expect(component.rows()[1].teacherCode).toBe('TCH002');
    expect(component.rows()[1].status).toBe('present');
    expect(component.rows()[1].checkIn).toBe('');
    expect(component.rows()[1].existingId).toBeNull();
  });

  it('should update row status', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onStatusChange(0, { target: { value: 'late' } } as unknown as Event);

    expect(component.rows()[0].status).toBe('late');
  });

  it('should update check-in time', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onCheckInChange(1, { target: { value: '08:30' } } as unknown as Event);

    expect(component.rows()[1].checkIn).toBe('08:30');
  });

  it('should update check-out time', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onCheckOutChange(0, { target: { value: '16:00' } } as unknown as Event);

    expect(component.rows()[0].checkOut).toBe('16:00');
  });

  it('should save with PATCH for existing and POST for new records', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.save();

    // t-1 has existing record → PATCH
    const patchReq = httpTesting.expectOne('/api/v1/teacher-attendance/ta-1');
    expect(patchReq.request.method).toBe('PATCH');
    expect(patchReq.request.body.status).toBe('present');
    patchReq.flush({ success: true, data: { id: 'ta-1' } });

    // t-2 is new → POST
    const postReq = httpTesting.expectOne('/api/v1/teacher-attendance');
    expect(postReq.request.method).toBe('POST');
    expect(postReq.request.body.teacherId).toBe('t-2');
    postReq.flush({ success: true, data: { id: 'ta-2' } });

    expect(component.saved()).toBe(true);
    expect(component.saving()).toBe(false);
  });

  it('should handle save error', () => {
    fixture.detectChanges();
    flushInitialRequests();

    // Keep only the teacher with an existing record to avoid forkJoin cancellation issues
    component.rows.set([component.rows()[0]]);
    component.save();

    const patchReq = httpTesting.expectOne('/api/v1/teacher-attendance/ta-1');
    patchReq.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('ATTENDANCE.SAVE_ERROR');
    expect(component.saving()).toBe(false);
  });

  it('should handle teacher load error', () => {
    fixture.detectChanges();

    const teacherReq = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    teacherReq.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('ATTENDANCE.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should reload when date changes', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.onDateChange({ target: { value: '2026-02-20' } } as unknown as Event);

    const teacherReq = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    teacherReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const attReq = httpTesting.expectOne((r) => r.url === '/api/v1/teacher-attendance');
    attReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    expect(component.selectedDate()).toBe('2026-02-20');
    expect(component.rows().length).toBe(0);
  });

  it('should not save when no rows exist', () => {
    fixture.detectChanges();
    flushInitialRequests();

    component.rows.set([]);
    component.save();

    // No HTTP requests should be made
    expect(component.saving()).toBe(false);
  });
});
