import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ReportCardDetailComponent } from './report-card-detail';

describe('ReportCardDetailComponent', () => {
  let fixture: ComponentFixture<ReportCardDetailComponent>;
  let component: ReportCardDetailComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ReportCardDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: ReportCardDetailComponent }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ReportCardDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDetail(): void {
    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/report-cards/'));
    req.flush({
      success: true,
      data: {
        id: 'rc-1',
        student: { firstName: 'Omar', lastName: 'Ali', studentCode: 'S001' },
        term: { name: 'Term 1' },
        classSection: { name: 'Class 1A' },
        overallPercentage: 85.5,
        overallGpa: 3.5,
        rankInClass: 1,
        teacherRemarks: 'Good job',
        generatedAt: '2026-02-19T10:00:00Z',
        snapshotData: {
          subjects: [
            { subjectName: 'Math', score: 90, maxScore: 100, percentage: 90, gradeLetter: 'A' },
            { subjectName: 'Science', score: 80, maxScore: 100, percentage: 80, gradeLetter: 'B' },
          ],
        },
      },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDetail();
    expect(component).toBeTruthy();
  });

  it('should load report card details', () => {
    fixture.detectChanges();
    flushDetail();

    expect(component.reportCard()?.student?.firstName).toBe('Omar');
    expect(component.reportCard()?.overallPercentage).toBe(85.5);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/report-cards/'));
    req.flush(null, { status: 404, statusText: 'Not Found' });

    expect(component.error()).toBe('REPORT_CARDS.LOAD_ERROR');
  });

  it('should expose subject grades from snapshotData', () => {
    fixture.detectChanges();
    flushDetail();

    expect(component.subjects().length).toBe(2);
    expect(component.subjects()[0].subjectName).toBe('Math');
    expect(component.subjects()[1].gradeLetter).toBe('B');
  });

  it('should handle null snapshotData', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/report-cards/'));
    req.flush({
      success: true,
      data: {
        id: 'rc-2',
        student: { firstName: 'Sara', lastName: 'Ahmed', studentCode: 'S002' },
        term: { name: 'Term 1' },
        classSection: { name: 'Class 1A' },
        overallPercentage: null,
        overallGpa: null,
        rankInClass: null,
        teacherRemarks: null,
        generatedAt: '2026-02-19T10:00:00Z',
        snapshotData: null,
      },
    });

    expect(component.subjects().length).toBe(0);
  });

  it('should toggle remarks editing', () => {
    fixture.detectChanges();
    flushDetail();

    component.startEditRemarks();
    expect(component.editingRemarks()).toBe(true);
    expect(component.remarksValue()).toBe('Good job');

    component.cancelEditRemarks();
    expect(component.editingRemarks()).toBe(false);
  });

  it('should save remarks', () => {
    fixture.detectChanges();
    flushDetail();

    component.startEditRemarks();
    component.remarksValue.set('Excellent work!');
    component.saveRemarks();

    const req = httpTesting.expectOne((r) => r.url.includes('/remarks'));
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.teacherRemarks).toBe('Excellent work!');
    req.flush({
      success: true,
      data: { ...component.reportCard(), teacherRemarks: 'Excellent work!' },
    });

    expect(component.editingRemarks()).toBe(false);
    expect(component.remarksSaved()).toBe(true);
  });
});
