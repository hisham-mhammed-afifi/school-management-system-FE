import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportCardsComponent } from './report-cards';

describe('ReportCardsComponent', () => {
  let fixture: ComponentFixture<ReportCardsComponent>;
  let component: ReportCardsComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportCardsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitial(data: unknown[] = []): void {
    const yearReq = httpTesting.expectOne((r) => r.url === '/api/v1/academic-years');
    yearReq.flush({
      success: true,
      data: [{ id: 'ay-1', name: '2025-2026' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    const csReq = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    csReq.flush({
      success: true,
      data: [{ id: 'cs-1', name: 'Class 1A' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    const rcReq = httpTesting.expectOne((r) => r.url === '/api/v1/report-cards');
    rcReq.flush({
      success: true,
      data,
      meta: { page: 1, limit: 20, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitial();
    expect(component).toBeTruthy();
  });

  it('should load report cards on init', () => {
    fixture.detectChanges();
    flushInitial([
      {
        id: 'rc-1',
        student: { firstName: 'Omar', lastName: 'Ali', studentCode: 'S001' },
        term: { name: 'Term 1' },
        classSection: { name: 'Class 1A' },
        overallPercentage: 85.5,
        overallGpa: 3.5,
        rankInClass: 1,
      },
    ]);

    expect(component.reportCards().length).toBe(1);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    httpTesting
      .expectOne((r) => r.url === '/api/v1/academic-years')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/class-sections')
      .flush({
        success: true,
        data: [],
        meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
      });

    const rcReq = httpTesting.expectOne((r) => r.url === '/api/v1/report-cards');
    rcReq.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('REPORT_CARDS.LOAD_ERROR');
  });

  it('should open and close generate modal', () => {
    fixture.detectChanges();
    flushInitial();

    component.openGenerate();
    expect(component.showGenerate()).toBe(true);

    component.closeGenerate();
    expect(component.showGenerate()).toBe(false);
  });

  it('should submit generate request', () => {
    fixture.detectChanges();
    flushInitial();

    component.generateTermId.set('t-1');
    component.generateClassId.set('cs-1');
    component.submitGenerate();

    const req = httpTesting.expectOne('/api/v1/report-cards');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.termId).toBe('t-1');
    req.flush({ success: true, data: { generated: 5, missingGrades: 0, skippedExisting: 2 } });

    expect(component.generateResult()?.generated).toBe(5);
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushInitial();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/report-cards');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 20, total: 0, totalPages: 0 } });
  });
});
