import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { GradingScaleDetailComponent } from './grading-scale-detail';

describe('GradingScaleDetailComponent', () => {
  let fixture: ComponentFixture<GradingScaleDetailComponent>;
  let component: GradingScaleDetailComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradingScaleDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: GradingScaleDetailComponent }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GradingScaleDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDetail(): void {
    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/grading-scales/'));
    req.flush({
      success: true,
      data: {
        id: 'gs-1',
        name: 'Standard',
        schoolId: 's-1',
        levels: [
          { id: 'l-1', letter: 'A', minScore: 90, maxScore: 100, gpaPoints: 4.0, orderIndex: 1 },
          { id: 'l-2', letter: 'B', minScore: 80, maxScore: 89, gpaPoints: 3.0, orderIndex: 2 },
        ],
        createdAt: '',
        updatedAt: '',
      },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDetail();
    expect(component).toBeTruthy();
  });

  it('should load grading scale details', () => {
    fixture.detectChanges();
    flushDetail();

    expect(component.scale()?.name).toBe('Standard');
    expect(component.scale()?.levels.length).toBe(2);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/grading-scales/'));
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(component.error()).toBe('GRADING_SCALES.LOAD_ERROR');
  });

  it('should toggle delete confirmation', () => {
    fixture.detectChanges();
    flushDetail();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });
});
