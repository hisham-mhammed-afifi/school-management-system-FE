import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { AttendanceComponent } from './attendance';

describe('AttendanceComponent', () => {
  let fixture: ComponentFixture<AttendanceComponent>;
  let component: AttendanceComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AttendanceComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(AttendanceComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushStudentTabRequests(): void {
    const csReq = httpTesting.expectOne((r) => r.url === '/api/v1/class-sections');
    csReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
  }

  function flushTeacherTabRequests(): void {
    const teacherReq = httpTesting.expectOne((r) => r.url === '/api/v1/teachers');
    teacherReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });

    const attReq = httpTesting.expectOne((r) => r.url === '/api/v1/teacher-attendance');
    attReq.flush({
      success: true,
      data: [],
      meta: { page: 1, limit: 100, total: 0, totalPages: 0 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushStudentTabRequests();
    expect(component).toBeTruthy();
  });

  it('should default to students tab', () => {
    fixture.detectChanges();
    flushStudentTabRequests();
    expect(component.activeTab()).toBe('students');
  });

  it('should switch to teachers tab', () => {
    fixture.detectChanges();
    flushStudentTabRequests();

    component.switchTab('teachers');
    fixture.detectChanges();

    flushTeacherTabRequests();

    expect(component.activeTab()).toBe('teachers');
  });

  it('should switch back to students tab', () => {
    fixture.detectChanges();
    flushStudentTabRequests();

    component.switchTab('teachers');
    fixture.detectChanges();
    flushTeacherTabRequests();

    component.switchTab('students');
    fixture.detectChanges();

    flushStudentTabRequests();

    expect(component.activeTab()).toBe('students');
  });
});
