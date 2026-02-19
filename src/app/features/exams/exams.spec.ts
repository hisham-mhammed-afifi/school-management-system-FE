import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ExamsComponent } from './exams';

describe('ExamsComponent', () => {
  let fixture: ComponentFixture<ExamsComponent>;
  let component: ExamsComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamsComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExamsComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushList(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 20, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushList();
    expect(component).toBeTruthy();
  });

  it('should load exams on init', () => {
    fixture.detectChanges();
    flushList([{ id: 'e-1', name: 'Midterm', examType: 'midterm', weight: 30 }]);

    expect(component.exams().length).toBe(1);
    expect(component.exams()[0].name).toBe('Midterm');
  });

  it('should filter by type', () => {
    fixture.detectChanges();
    flushList();

    component.onTypeFilter({ target: { value: 'quiz' } } as unknown as Event);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    expect(req.request.params.get('examType')).toBe('quiz');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('EXAMS.LOAD_ERROR');
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushList();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 20, total: 0, totalPages: 0 } });
  });
});
