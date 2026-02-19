import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  GradingScale,
  CreateGradingScaleRequest,
  UpdateGradingScaleRequest,
  ListGradingScalesQuery,
} from '@core/models/grading-scale';

@Injectable({ providedIn: 'root' })
export class GradingScaleService {
  private readonly http = inject(HttpClient);

  list(query: ListGradingScalesQuery = {}): Observable<PaginatedResponse<GradingScale>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);

    return this.http.get<PaginatedResponse<GradingScale>>('/api/v1/grading-scales', { params });
  }

  get(id: string): Observable<ApiResponse<GradingScale>> {
    return this.http.get<ApiResponse<GradingScale>>(`/api/v1/grading-scales/${id}`);
  }

  create(data: CreateGradingScaleRequest): Observable<ApiResponse<GradingScale>> {
    return this.http.post<ApiResponse<GradingScale>>('/api/v1/grading-scales', data);
  }

  update(id: string, data: UpdateGradingScaleRequest): Observable<ApiResponse<GradingScale>> {
    return this.http.patch<ApiResponse<GradingScale>>(`/api/v1/grading-scales/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/grading-scales/${id}`);
  }
}
