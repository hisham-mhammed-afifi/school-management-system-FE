import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { DashboardComponent } from './dashboard';

describe('DashboardComponent', () => {
  let fixture: ComponentFixture<DashboardComponent>;
  let component: DashboardComponent;
  let httpTesting: HttpTestingController;

  const mockOverview = {
    students: 120,
    teachers: 15,
    classSections: 8,
    attendanceToday: 92.5,
    fees: {
      outstanding: { amount: 5000, count: 10 },
      collected: { amount: 25000, count: 50 },
      overdue: { amount: 2000, count: 5 },
    },
  };

  const mockAttendance = [
    {
      classSectionId: 'cs-1',
      className: 'Grade 1A',
      total: 30,
      present: 28,
      absent: 2,
      rate: 93.33,
    },
  ];

  const mockFees = {
    outstanding: { amount: 5000, count: 10 },
    collected: { amount: 25000, count: 50 },
    overdue: { amount: 2000, count: 5 },
  };

  const mockActivity = [
    {
      id: 'a-1',
      action: 'created',
      actor: 'admin@school.com',
      resourceType: 'student',
      resourceId: 's-1',
      changes: {},
      createdAt: '2026-02-20T10:00:00Z',
      schoolId: 'sch-1',
      userId: 'u-1',
    },
  ];

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [DashboardComponent],
      providers: [
        provideRouter([]),
        provideHttpClient(),
        provideHttpClientTesting(),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(DashboardComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  function flushSchoolDashboard(): void {
    httpTesting
      .expectOne('/api/v1/dashboard/overview')
      .flush({ success: true, data: mockOverview });
    httpTesting
      .expectOne('/api/v1/dashboard/attendance-today')
      .flush({ success: true, data: mockAttendance });
    httpTesting
      .expectOne('/api/v1/dashboard/fees-summary')
      .flush({ success: true, data: mockFees });
    httpTesting
      .expectOne('/api/v1/dashboard/recent-activity')
      .flush({ success: true, data: mockActivity });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushSchoolDashboard();
    expect(component).toBeTruthy();
  });

  it('should render welcome banner', () => {
    fixture.detectChanges();
    flushSchoolDashboard();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.querySelector('section')).toBeTruthy();
  });

  it('should load school dashboard data on init', () => {
    fixture.detectChanges();
    flushSchoolDashboard();

    expect(component.overview()?.students).toBe(120);
    expect(component.attendance().length).toBe(1);
    expect(component.fees()?.collected.amount).toBe(25000);
    expect(component.activity().length).toBe(1);
  });

  it('should render stats cards after loading', () => {
    fixture.detectChanges();
    flushSchoolDashboard();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('120');
    expect(el.textContent).toContain('15');
    expect(el.textContent).toContain('8');
    expect(el.textContent).toContain('92.5');
  });

  it('should render attendance table', () => {
    fixture.detectChanges();
    flushSchoolDashboard();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('Grade 1A');
    expect(el.textContent).toContain('28');
  });

  it('should render recent activity', () => {
    fixture.detectChanges();
    flushSchoolDashboard();
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    expect(el.textContent).toContain('admin@school.com');
    expect(el.textContent).toContain('student');
  });

  it('should handle overview error', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne('/api/v1/dashboard/overview')
      .flush(null, { status: 500, statusText: 'Server Error' });
    httpTesting.expectOne('/api/v1/dashboard/attendance-today').flush({ success: true, data: [] });
    httpTesting
      .expectOne('/api/v1/dashboard/fees-summary')
      .flush({ success: true, data: mockFees });
    httpTesting.expectOne('/api/v1/dashboard/recent-activity').flush({ success: true, data: [] });

    expect(component.overviewError()).toBe(true);
    expect(component.overviewLoading()).toBe(false);
  });
});
