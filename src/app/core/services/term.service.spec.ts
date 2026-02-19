import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { TermService } from './term.service';

describe('TermService', () => {
  let service: TermService;
  let httpTesting: HttpTestingController;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [provideHttpClient(), provideHttpClientTesting()],
    });

    service = TestBed.inject(TermService);
    httpTesting = TestBed.inject(HttpTestingController);
  });

  afterEach(() => {
    httpTesting.verify();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should list terms by academic year', () => {
    service.listByYear('year-1').subscribe();

    const req = httpTesting.expectOne('/api/v1/academic-years/year-1/terms');
    expect(req.request.method).toBe('GET');
    req.flush({ success: true, data: [] });
  });
});
