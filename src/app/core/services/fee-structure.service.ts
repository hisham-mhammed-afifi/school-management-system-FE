import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  FeeStructure,
  CreateFeeStructureRequest,
  UpdateFeeStructureRequest,
  ListFeeStructuresQuery,
} from '@core/models/fee-structure';

@Injectable({ providedIn: 'root' })
export class FeeStructureService {
  private readonly http = inject(HttpClient);

  list(query: ListFeeStructuresQuery = {}): Observable<PaginatedResponse<FeeStructure>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.academicYearId) params = params.set('academicYearId', query.academicYearId);
    if (query.gradeId) params = params.set('gradeId', query.gradeId);
    if (query.feeCategoryId) params = params.set('feeCategoryId', query.feeCategoryId);
    if (query.isRecurring !== undefined) params = params.set('isRecurring', query.isRecurring);

    return this.http.get<PaginatedResponse<FeeStructure>>('/api/v1/fee-structures', { params });
  }

  get(id: string): Observable<ApiResponse<FeeStructure>> {
    return this.http.get<ApiResponse<FeeStructure>>(`/api/v1/fee-structures/${id}`);
  }

  create(data: CreateFeeStructureRequest): Observable<ApiResponse<FeeStructure>> {
    return this.http.post<ApiResponse<FeeStructure>>('/api/v1/fee-structures', data);
  }

  update(id: string, data: UpdateFeeStructureRequest): Observable<ApiResponse<FeeStructure>> {
    return this.http.patch<ApiResponse<FeeStructure>>(`/api/v1/fee-structures/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/fee-structures/${id}`);
  }
}
