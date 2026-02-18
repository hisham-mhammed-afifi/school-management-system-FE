import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { SchoolSwitcherComponent } from './school-switcher';
import { SchoolService } from '@core/services/school.service';

describe('SchoolSwitcherComponent', () => {
  let fixture: ComponentFixture<SchoolSwitcherComponent>;
  let component: SchoolSwitcherComponent;
  let httpTesting: HttpTestingController;
  let schoolService: SchoolService;

  const mockSchoolsResponse = {
    success: true,
    data: [
      { id: 's1', name: 'School One' },
      { id: 's2', name: 'School Two' },
    ],
    meta: { page: 1, limit: 100, total: 2, totalPages: 1 },
  };

  beforeEach(async () => {
    localStorage.clear();

    await TestBed.configureTestingModule({
      imports: [SchoolSwitcherComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    schoolService = TestBed.inject(SchoolService);
    fixture = TestBed.createComponent(SchoolSwitcherComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
    localStorage.clear();
  });

  it('should create', () => {
    fixture.detectChanges();
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush(mockSchoolsResponse);
    expect(component).toBeTruthy();
  });

  it('should fetch schools on init when list is empty', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    expect(req.request.method).toBe('GET');
    req.flush(mockSchoolsResponse);

    expect(schoolService.schools().length).toBe(2);
  });

  it('should render select element with options after fetch', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush(mockSchoolsResponse);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select');
    expect(select).toBeTruthy();

    const options = el.querySelectorAll('option');
    // 1 placeholder + 2 schools
    expect(options.length).toBe(3);
  });

  it('should call selectSchool when a school is chosen', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush(mockSchoolsResponse);
    fixture.detectChanges();

    const selectSpy = vi.spyOn(schoolService, 'selectSchool');

    component.onSchoolChange({ target: { value: 's1' } } as unknown as Event);
    expect(selectSpy).toHaveBeenCalledWith('s1');
  });

  it('should have aria-label on select', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/platform/schools');
    req.flush(mockSchoolsResponse);
    fixture.detectChanges();

    const el = fixture.nativeElement as HTMLElement;
    const select = el.querySelector('select');
    expect(select?.getAttribute('aria-label')).toBeTruthy();
  });
});
