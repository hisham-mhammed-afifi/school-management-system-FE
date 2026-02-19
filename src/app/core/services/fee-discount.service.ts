import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  FeeDiscount,
  CreateFeeDiscountRequest,
  UpdateFeeDiscountRequest,
  ListFeeDiscountsQuery,
} from '@core/models/fee-discount';

@Injectable({ providedIn: 'root' })
export class FeeDiscountService {
  private readonly http = inject(HttpClient);

  list(query: ListFeeDiscountsQuery = {}): Observable<PaginatedResponse<FeeDiscount>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.studentId) params = params.set('studentId', query.studentId);
    if (query.feeStructureId) params = params.set('feeStructureId', query.feeStructureId);

    return this.http.get<PaginatedResponse<FeeDiscount>>('/api/v1/fee-discounts', { params });
  }

  create(data: CreateFeeDiscountRequest): Observable<ApiResponse<FeeDiscount>> {
    return this.http.post<ApiResponse<FeeDiscount>>('/api/v1/fee-discounts', data);
  }

  update(id: string, data: UpdateFeeDiscountRequest): Observable<ApiResponse<FeeDiscount>> {
    return this.http.patch<ApiResponse<FeeDiscount>>(`/api/v1/fee-discounts/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/fee-discounts/${id}`);
  }
}
