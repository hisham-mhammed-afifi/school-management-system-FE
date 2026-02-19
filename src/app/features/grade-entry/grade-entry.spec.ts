import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { GradeEntryComponent } from './grade-entry';

describe('GradeEntryComponent', () => {
  let fixture: ComponentFixture<GradeEntryComponent>;
  let component: GradeEntryComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradeEntryComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(GradeEntryComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushInitial(): void {
    const examReq = httpTesting.expectOne((r) => r.url === '/api/v1/exams');
    examReq.flush({
      success: true,
      data: [{ id: 'e-1', name: 'Midterm', examType: 'midterm' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });

    const csReq = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    csReq.flush({
      success: true,
      data: [{ id: 'cs-1', name: 'Class 1A' }],
      meta: { page: 1, limit: 100, total: 1, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushInitial();
    expect(component).toBeTruthy();
  });

  it('should load exams and class sections on init', () => {
    fixture.detectChanges();
    flushInitial();

    expect(component.exams().length).toBe(1);
    expect(component.classSections().length).toBe(1);
  });

  it('should load exam subjects when exam is selected', () => {
    fixture.detectChanges();
    flushInitial();

    component.onExamChange({ target: { value: 'e-1' } } as unknown as Event);

    const subjectsReq = httpTesting.expectOne('/api/v1/exams/e-1/subjects');
    subjectsReq.flush({
      success: true,
      data: [
        {
          id: 'es-1',
          subjectId: 's-1',
          gradeId: 'g-1',
          maxScore: 100,
          subject: { id: 's-1', name: 'Math' },
          grade: { id: 'g-1', name: 'Grade 1' },
        },
      ],
    });

    expect(component.examSubjects().length).toBe(1);
  });

  it('should update row score', () => {
    fixture.detectChanges();
    flushInitial();

    component.rows.set([
      {
        studentId: 'st-1',
        studentCode: 'S001',
        firstName: 'A',
        lastName: 'B',
        score: null,
        notes: '',
        existingId: null,
        existingGradeLetter: null,
      },
    ]);

    component.onScoreChange(0, { target: { value: '85' } } as unknown as Event);

    expect(component.rows()[0].score).toBe(85);
  });

  it('should update row notes', () => {
    fixture.detectChanges();
    flushInitial();

    component.rows.set([
      {
        studentId: 'st-1',
        studentCode: 'S001',
        firstName: 'A',
        lastName: 'B',
        score: 90,
        notes: '',
        existingId: null,
        existingGradeLetter: null,
      },
    ]);

    component.onNotesChange(0, { target: { value: 'Great' } } as unknown as Event);

    expect(component.rows()[0].notes).toBe('Great');
  });

  it('should save grades', () => {
    fixture.detectChanges();
    flushInitial();

    component.selectedExamSubjectId.set('es-1');
    component.rows.set([
      {
        studentId: 'st-1',
        studentCode: 'S001',
        firstName: 'A',
        lastName: 'B',
        score: 85,
        notes: '',
        existingId: null,
        existingGradeLetter: null,
      },
    ]);

    component.save();

    const req = httpTesting.expectOne('/api/v1/student-grades/bulk');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.examSubjectId).toBe('es-1');
    expect(req.request.body.grades[0].score).toBe(85);
    req.flush({ success: true, data: [{ id: 'sg-1' }] });

    expect(component.saved()).toBe(true);
  });

  it('should handle save error', () => {
    fixture.detectChanges();
    flushInitial();

    component.selectedExamSubjectId.set('es-1');
    component.rows.set([
      {
        studentId: 'st-1',
        studentCode: 'S001',
        firstName: 'A',
        lastName: 'B',
        score: 85,
        notes: '',
        existingId: null,
        existingGradeLetter: null,
      },
    ]);

    component.save();

    const req = httpTesting.expectOne('/api/v1/student-grades/bulk');
    req.flush(null, { status: 500, statusText: 'Server Error' });

    expect(component.error()).toBe('GRADE_ENTRY.SAVE_ERROR');
  });

  it('should not save when no exam subject selected', () => {
    fixture.detectChanges();
    flushInitial();

    component.save();

    expect(component.saving()).toBe(false);
  });
});
