import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ChildReportCardsComponent } from './child-report-cards';

describe('ChildReportCardsComponent', () => {
  let fixture: ComponentFixture<ChildReportCardsComponent>;
  let component: ChildReportCardsComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    const paramMap = new Map<string, string>();
    paramMap.set('studentId', 's-1');

    await TestBed.configureTestingModule({
      imports: [ChildReportCardsComponent],
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
    await router.navigateByUrl('/schools/test-school/parent-portal/s-1/report-cards');
    fixture = TestBed.createComponent(ChildReportCardsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushReportCards(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/report-cards');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushReportCards();
    expect(component).toBeTruthy();
  });

  it('should load report cards on init', () => {
    fixture.detectChanges();
    flushReportCards([
      {
        id: 'rc-1',
        term: { name: 'Term 1' },
        classSection: { name: 'Class 1A' },
        overallPercentage: 85.5,
        overallGpa: 3.5,
        rankInClass: 1,
        generatedAt: '2026-02-19T10:00:00Z',
      },
    ]);

    expect(component.reportCards().length).toBe(1);
    expect(component.reportCards()[0].overallPercentage).toBe(85.5);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/report-cards');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(component.error()).toBe('PARENT_PORTAL.LOAD_REPORT_CARDS_ERROR');
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushReportCards();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/report-cards');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });
});
