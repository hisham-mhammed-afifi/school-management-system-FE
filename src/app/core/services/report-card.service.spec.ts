import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { ReportCardService } from './report-card.service';

describe('ReportCardService', () => {
  let service: ReportCardService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(ReportCardService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list report cards', () => {
    service.list({ termId: 't-1', page: 1, limit: 20 }).subscribe();

    const req = httpTesting.expectOne((r) => r.url === '/api/v1/report-cards');
    expect(req.request.method).toBe('GET');
    expect(req.request.params.get('termId')).toBe('t-1');
    req.flush({ success: true, data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  });

  it('should get a report card', () => {
    service.get('rc-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/report-cards/rc-1');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: { id: 'rc-1' } });
  });

  it('should generate report cards', () => {
    service.generate({ termId: 't-1', classSectionId: 'cs-1' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/report-cards');
    expect(req.request.method).toBe('POST');
    expect(req.request.body.termId).toBe('t-1');
    req.flush({ success: true, data: { generated: 5, missingGrades: 0, skippedExisting: 2 } });
  });

  it('should update report card remarks', () => {
    service.updateRemarks('rc-1', { teacherRemarks: 'Great work!' }).subscribe();

    const req = httpTesting.expectOne('/api/v1/report-cards/rc-1/remarks');
    expect(req.request.method).toBe('PATCH');
    expect(req.request.body.teacherRemarks).toBe('Great work!');
    req.flush({ success: true, data: { id: 'rc-1' } });
  });
});
