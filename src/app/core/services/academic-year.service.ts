import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { AcademicYear, ListAcademicYearsQuery } from '@core/models/academic-year';

@Injectable({ providedIn: 'root' })
export class AcademicYearService {
  private readonly http = inject(HttpClient);

  list(query: ListAcademicYearsQuery = {}): Observable<PaginatedResponse<AcademicYear>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.isActive !== undefined) params = params.set('isActive', query.isActive);

    return this.http.get<PaginatedResponse<AcademicYear>>('/api/v1/academic-years', { params });
  }
}
