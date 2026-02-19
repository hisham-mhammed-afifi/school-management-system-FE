import { TestBed, ComponentFixture } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { provideRouter } from '@angular/router';
import { provideTranslateService } from '@ngx-translate/core';
import { FeeStructureDetailComponent } from './fee-structure-detail';

describe('FeeStructureDetailComponent', () => {
  let fixture: ComponentFixture<FeeStructureDetailComponent>;
  let component: FeeStructureDetailComponent;
  let httpTesting: HttpTestingController;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FeeStructureDetailComponent],
      providers: [
        provideHttpClient(),
        provideHttpClientTesting(),
        provideRouter([{ path: '**', component: FeeStructureDetailComponent }]),
        provideTranslateService({ fallbackLang: 'en' }),
      ],
    }).compileComponents();

    httpTesting = TestBed.inject(HttpTestingController);
    fixture = TestBed.createComponent(FeeStructureDetailComponent);
    component = fixture.componentInstance;
  });

  afterEach(() => {
    httpTesting.verify();
  });

  function flushDetail(): void {
    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/fee-structures/'));
    req.flush({
      success: true,
      data: {
        id: 'fs-1',
        name: 'Tuition Fee',
        schoolId: 's-1',
        academicYearId: 'ay-1',
        gradeId: 'g-1',
        feeCategoryId: 'fc-1',
        amount: 5000,
        dueDate: '2026-03-01',
        isRecurring: true,
        recurrence: 'term',
        createdAt: '',
        updatedAt: '',
        academicYear: { id: 'ay-1', name: '2025-2026' },
        grade: { id: 'g-1', name: 'Grade 1' },
        feeCategory: { id: 'fc-1', name: 'Tuition' },
      },
    });
  }

  function flushDiscounts(data: unknown[] = []): void {
    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-discounts');
    req.flush({
      success: true,
      data,
      meta: { page: 1, limit: 100, total: data.length, totalPages: 1 },
    });
  }

  it('should create', () => {
    fixture.detectChanges();
    flushDetail();
    flushDiscounts();
    expect(component).toBeTruthy();
  });

  it('should load fee structure details', () => {
    fixture.detectChanges();
    flushDetail();
    flushDiscounts();

    expect(component.structure()?.name).toBe('Tuition Fee');
    expect(component.structure()?.amount).toBe(5000);
  });

  it('should handle load error', () => {
    fixture.detectChanges();

    const req = httpTesting.expectOne((r) => r.url.startsWith('/api/v1/fee-structures/'));
    req.flush(null, { status: 404, statusText: 'Not Found' });
    flushDiscounts();

    expect(component.error()).toBe('FEE_STRUCTURES.LOAD_ERROR');
  });

  it('should toggle delete confirmation', () => {
    fixture.detectChanges();
    flushDetail();
    flushDiscounts();

    component.confirmDelete();
    expect(component.showDeleteConfirm()).toBe(true);

    component.cancelDelete();
    expect(component.showDeleteConfirm()).toBe(false);
  });

  it('should load discounts', () => {
    fixture.detectChanges();
    flushDetail();
    flushDiscounts([
      {
        id: 'fd-1',
        studentId: 's-1',
        feeStructureId: 'fs-1',
        discountType: 'percentage',
        amount: 10,
        reason: 'Scholarship',
        student: { id: 's-1', firstName: 'John', lastName: 'Doe', studentCode: 'STU-001' },
      },
    ]);

    expect(component.discounts().length).toBe(1);
    expect(component.discounts()[0].amount).toBe(10);
  });
});
