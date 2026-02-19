import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { FeeInvoiceService } from './fee-invoice.service';

describe('FeeInvoiceService', () => {
  let service: FeeInvoiceService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(FeeInvoiceService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list fee invoices with filters', () => {
    service.list({ status: 'issued', page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/fee-invoices');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('status')).toBe('issued');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a fee invoice', () => {
    service.get('inv-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-invoices/inv-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'inv-1', invoiceNumber: 'INV-001' } });
  });

  it('should create a fee invoice', () => {
    const body = {
      studentId: 's-1',
      dueDate: '2026-03-01',
      items: [{ feeStructureId: 'fs-1', unitAmount: 5000 }],
    };
    service.create(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-invoices');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.studentId).toBe('s-1');
    req.flush({ success: true, data: { id: 'inv-new' } });
  });

  it('should bulk generate invoices', () => {
    const body = {
      academicYearId: 'ay-1',
      gradeId: 'g-1',
      dueDate: '2026-03-01',
      feeStructureIds: ['fs-1'],
    };
    service.bulkGenerate(body).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-invoices/bulk-generate');
    expect(req.request.method).toBe('POST');
    req.flush({ success: true, data: { totalCreated: 30, totalNet: 150000, skipped: [] } });
  });

  it('should issue an invoice', () => {
    service.issue('inv-1', true).subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-invoices/inv-1/issue');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.notifyGuardian).toBe(true);
    req.flush({ success: true, data: { id: 'inv-1', status: 'issued' } });
  });

  it('should cancel an invoice', () => {
    service.cancel('inv-1', 'Duplicate').subscribe();

    const req = httpTesting.expectOne('/api/v1/fee-invoices/inv-1/cancel');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.reason).toBe('Duplicate');
    req.flush({ success: true, data: { id: 'inv-1', status: 'cancelled' } });
  });
});
