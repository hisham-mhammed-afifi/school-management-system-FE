import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter, Router } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeStructureFormComponent } from './fee-structure-form';

describe('FeeStructureFormComponent', () => {
  let fixture: ComponentFixture<FeeStructureFormComponent>;
  let component: FeeStructureFormComponent;
  let httpTesting: HttpTestingController;
  let router: Router;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructureFormComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: 'schools/:schoolId', children: [{ path: '**', children: [] }] }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    router = TestBed.inject(Router);
    await router.navigateByUrl('/schools/test-school/fee-structures/new');
    fixture = TestBed.createComponent(FeeStructureFormComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDropdowns(): void {
    httpTesting
      .expectOne((r) => r.url === '/api/v1/academic-years')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/grades')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
    httpTesting
      .expectOne((r) => r.url === '/api/v1/fee-categories')
      .flush({ success: true, data: [], meta: { page: 1, limit: 100, total: 0, totalPages: 0 } });
  }

  it('should create in add mode', () => {
    fixture.detectChanges();
    flushDropdowns();
    expect(component).toBeTruthy();
    expect(component.isEdit()).toBe(false);
  });

  it('should not submit invalid form', () => {
    fixture.detectChanges();
    flushDropdowns();

    component.onSubmit();

    expect(component.saving()).toBe(false);
    httpTesting.expectNone('/api/v1/fee-structures');
  });

  it('should submit valid form for creation', () => {
    fixture.detectChanges();
    flushDropdowns();
    const navigateSpy = vi.spyOn(router, 'navigate').mockReturnValue(Promise.resolve(true));

    component.form.patchValue({
      academicYearId: 'ay-1',
      gradeId: 'g-1',
      feeCategoryId: 'fc-1',
      name: 'Tuition Fee',
      amount: 5000,
    });

    component.onSubmit();

    const req = httpTesting.expectOne('/api/v1/fee-structures');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.name).toBe('Tuition Fee');
    expect(req.request.body.amount).toBe(5000);
    req.flush({ success: true, data: { id: 'fs-new' } });

    expect(navigateSpy).toHaveBeenCalledWith([
      '/schools',
      'test-school',
      'fee-structures',
      'fs-new',
    ]);
  });
});
