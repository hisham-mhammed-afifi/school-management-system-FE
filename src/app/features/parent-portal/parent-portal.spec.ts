import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { ParentPortalComponent } from './parent-portal';

describe('ParentPortalComponent', () => {
  let fixture: ComponentFixture<ParentPortalComponent>;
  let component: ParentPortalComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [ParentPortalComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(ParentPortalComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushChildren(data: unknown[] = []): void {
    const req = httpTesting.expectOne('/api/v1/my/children');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 10, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushChildren();
    expect(component).toBeTruthy();
  });

  it('should load children on init', () => {
    fixture.detectChanges();
    flushChildren([
      { id: 's-1', firstName: 'Ahmad', lastName: 'Ali', studentCode: 'STU-001' },
      { id: 's-2', firstName: 'Sara', lastName: 'Ali', studentCode: 'STU-002' },
    ]);

    expect(component.children().length).toBe(2);
    expect(component.children()[0].firstName).toBe('Ahmad');
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne('/api/v1/my/children');
    req.flush(null, { status: 403, statusText: 'Forbidden' });

    expect(component.error()).toBe('PARENT_PORTAL.LOAD_ERROR');
    expect(component.loading()).toBe(false);
  });
});
