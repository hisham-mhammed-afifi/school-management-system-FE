import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { Enrollment, ListEnrollmentsQuery } from '@core/models/enrollment';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private readonly http = inject(HttpClient);

  list(query: ListEnrollmentsQuery = {}): Observable<PaginatedResponse<Enrollment>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.status) params = params.set('status', query.status);
    if (query.academicYearId) params = params.set('academicYearId', query.academicYearId);
    if (query.classSectionId) params = params.set('classSectionId', query.classSectionId);
    if (query.studentId) params = params.set('studentId', query.studentId);

    return this.http.get<PaginatedResponse<Enrollment>>('/api/v1/enrollments', { params });
  }
}
