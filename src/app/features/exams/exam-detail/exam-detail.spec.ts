import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ExamDetailComponent } from './exam-detail';

describe('ExamDetailComponent', () => {
  let fixture: ComponentFixture<ExamDetailComponent>;
  let component: ExamDetailComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ExamDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: ExamDetailComponent }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ExamDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitial(): void {
    const examReq = httpTesting.expectOne((r) => r.url.match(/\/api\/v1\/exams\/[^/]+$/) !== null);
    examReq.flush({
      success: true,
      data: {
        id: 'e-1',
        name: 'Midterm',
        examType: 'midterm',
        weight: 30,
        startDate: null,
        endDate: null,
        gradingScale: { id: 'gs-1', name: 'Standard' },
      },
    });

    const subjectsReq = httpTesting.expectOne((r) => r.url.includes('/subjects'));
    subjectsReq.flush({
      success: true,
      data: [
        {
          id: 'es-1',
          subjectId: 's-1',
          gradeId: 'g-1',
          maxScore: 100,
          passScore: 50,
          subject: { id: 's-1', name: 'Math', code: 'MATH' },
          grade: { id: 'g-1', name: 'Grade 1' },
        },
      ],
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitial();
    expect(component).toBeTruthy();
  });

  it('should load exam details and subjects', () => {
    fixture.detectChanges();
    flushInitial();

    expect(component.exam()?.name).toBe('Midterm');
    expect(component.examSubjects().length).toBe(1);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const examReq = httpTesting.expectOne((r) => r.url.match(/\/api\/v1\/exams\/[^/]+$/) !== null);
    examReq.flush(null, { status: 404, statusText: 'Not Found' });

    const subjectsReq = httpTesting.expectOne((r) => r.url.includes('/subjects'));
    subjectsReq.flush({ success: true, data: [] });

    expect(component.error()).toBe('EXAMS.LOAD_ERROR');
  });

  it('should toggle delete confirmation', () => {
    fixture.detectChanges();
    flushInitial();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should open and close add subject modal', () => {
    fixture.detectChanges();
    flushInitial();

    component.openAddSubject();

    const subjectsReq = httpTesting.expectOne((r) => r.url === '/api/v1/subjects');
    subjectsReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const gradesReq = httpTesting.expectOne((r) => r.url === '/api/v1/grades');
    gradesReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    expect(component.showAddSubject()).toBe(true);

    component.closeAddSubject();
    expect(component.showAddSubject()).toBe(false);
  });
});
