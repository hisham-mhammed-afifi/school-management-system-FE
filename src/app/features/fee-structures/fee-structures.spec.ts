import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeStructuresComponent } from './fee-structures';

describe('FeeStructuresComponent', () => {
  let fixture: ComponentFixture<FeeStructuresComponent>;
  let component: FeeStructuresComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructuresComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeeStructuresComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDropdowns(): void {
    httpTesting
      .expectOne((r) => r.url === '/api/v1/academic-years')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/fee-categories')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
  }

  function flushList(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-structures');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDropdowns();
    flushList();
    expect(component).toBeTruthy();
  });

  it('should load fee structures on init', () => {
    fixture.detectChanges();
    flushDropdowns();
    flushList([
      {
        id: 'fs-1',
        name: 'Tuition Fee',
        amount: 5000,
        isRecurring: true,
        recurrence: 'term',
        feeCategory: { id: 'fc-1', name: 'Tuition' },
        grade: { id: 'g-1', name: 'Grade 1' },
      },
    ]);

    expect(component.structures().length).toBe(1);
    expect(component.structures()[0].name).toBe('Tuition Fee');
  });

  it('should handle load error', () => {
    fixture.detectChanges();
    flushDropdowns();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-structures');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('FEE_STRUCTURES.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushDropdowns();
    flushList();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-structures');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });
});
