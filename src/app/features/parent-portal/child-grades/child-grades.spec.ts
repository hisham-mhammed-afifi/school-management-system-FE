import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, ActivatedRoute, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ChildGradesComponent } from './child-grades';

describe('ChildGradesComponent', () => {
  let fixture: ComponentFixture<ChildGradesComponent>;
  let component: ChildGradesComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    const paramMap = new Map<string, string>();
    paramMap.set('studentId', 's-1');

    await TestBed.configureTestingModule({
      imports: [ChildGradesComponent],
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
    await router.navigateByUrl('/schools/test-school/parent-portal/s-1/grades');
    fixture = TestBed.createComponent(ChildGradesComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushGrades(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/grades');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushGrades();
    expect(component).toBeTruthy();
  });

  it('should load grades on init', () => {
    fixture.detectChanges();
    flushGrades([
      {
        id: 'g-1',
        score: 90,
        gradeLetter: 'A',
        examSubject: {
          maxScore: 100,
          subject: { name: 'Math' },
          exam: { name: 'Midterm' },
        },
      },
    ]);

    expect(component.grades().length).toBe(1);
    expect(component.grades()[0].score).toBe(90);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/grades');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(component.error()).toBe('PARENT_PORTAL.LOAD_GRADES_ERROR');
  });

  it('should change page', () => {
    fixture.detectChanges();
    flushGrades();

    component.onPageChange(2);

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/my/children/s-1/grades');
    expect(req.request.params.get('page')).toBe('2');
    req.flush({ success: true, data: [], meta: { page: 2, limit: 10, total: 0, totalPages: 0 } });
  });
});
