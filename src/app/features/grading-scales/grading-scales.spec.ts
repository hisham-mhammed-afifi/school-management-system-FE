import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { GradingScalesComponent } from './grading-scales';

describe('GradingScalesComponent', () => {
  let fixture: ComponentFixture<GradingScalesComponent>;
  let component: GradingScalesComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingScalesComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GradingScalesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushList(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grading-scales');
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

  it('should load grading scales on init', () => {
    fixture.detectChanges();
    flushList([
      {
        id: 'gs-1',
        name: 'Standard',
        levels: [{ id: 'l-1', letter: 'A', minScore: 90, maxScore: 100 }],
      },
    ]);

    expect(component.scales().length).toBe(1);
    expect(component.scales()[0].name).toBe('Standard');
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grading-scales');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('GRADING_SCALES.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushList();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/grading-scales');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 20, total: 0, totalPages: 0 } });
  });
});
