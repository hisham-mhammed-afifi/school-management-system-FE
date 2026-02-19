import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  FeeCategory,
  CreateFeeCategoryRequest,
  UpdateFeeCategoryRequest,
  ListFeeCategoriesQuery,
} from '@core/models/fee-category';

@Injectable({ providedIn: 'root' })
export class FeeCategoryService {
  private readonly http = inject(HttpClient);

  list(query: ListFeeCategoriesQuery = {}): Observable<PaginatedResponse<FeeCategory>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);

    return this.http.get<PaginatedResponse<FeeCategory>>('/api/v1/fee-categories', { params });
  }

  create(data: CreateFeeCategoryRequest): Observable<ApiResponse<FeeCategory>> {
    return this.http.post<ApiResponse<FeeCategory>>('/api/v1/fee-categories', data);
  }

  update(id: string, data: UpdateFeeCategoryRequest): Observable<ApiResponse<FeeCategory>> {
    return this.http.patch<ApiResponse<FeeCategory>>(`/api/v1/fee-categories/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/fee-categories/${id}`);
  }
}
