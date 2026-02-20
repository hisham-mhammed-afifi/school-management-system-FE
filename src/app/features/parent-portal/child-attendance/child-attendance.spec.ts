import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ChildAttendanceComponent } from './child-attendance';

describe('ChildAttendanceComponent', () => {
  let fixture: ComponentFixture<ChildAttendanceComponent>;
  let component: ChildAttendanceComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    const paramMap = new Map<string, string>();
    paramMap.set('studentId', 's-1');

    await TestBed.configureTestingModule({
      imports: [ChildAttendanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
        { provide: ActivatedRoute, useValue: { snapshot: { paramMap } } },
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/parent-portal/s-1/attendance');
    fixture = TestBed.createComponent(ChildAttendanceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushAttendance(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/attendance');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushAttendance();
    expect(component).toBeTruthy();
  });

  it('should load attendance on init', () => {
    fixture.detectChanges();
    flushAttendance([
      {
        id: 'a-1',
        date: '2026-02-18',
        status: 'present',
        classSection: { id: 'cs-1', name: 'Class 1A' },
        notes: null,
      },
    ]);

    expect(component.records().length).toBe(1);
    expect(component.records()[0].status).toBe('present');
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/attendance');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(component.error()).toBe('PARENT_PORTAL.LOAD_ATTENDANCE_ERROR');
  });

  it('should return correct status class', () => {
    expect(component.statusClass('present')).toContain('bg-success-bg');
    expect(component.statusClass('absent')).toContain('bg-danger-bg');
    expect(component.statusClass('late')).toContain('bg-warning-bg');
    expect(component.statusClass('excused')).toContain('bg-info-bg');
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushAttendance();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/attendance');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });
});
