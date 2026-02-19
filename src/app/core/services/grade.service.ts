import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { Grade, ListGradesQuery } from '@core/models/grade';

@Injectable({ providedIn: 'root' })
export class GradeService {
  private readonly http = inject(HttpClient);

  list(query: ListGradesQuery = {}): Observable<PaginatedResponse<Grade>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<PaginatedResponse<Grade>>('/api/v1/grades', { params });
  }
}
