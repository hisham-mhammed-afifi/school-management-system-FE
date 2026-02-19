import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  FeePayment,
  CreateFeePaymentRequest,
  ListFeePaymentsQuery,
} from '@core/models/fee-payment';

@Injectable({ providedIn: 'root' })
export class FeePaymentService {
  private readonly http = inject(HttpClient);

  list(query: ListFeePaymentsQuery = {}): Observable<PaginatedResponse<FeePayment>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.invoiceId) params = params.set('invoiceId', query.invoiceId);
    if (query.paymentMethod) params = params.set('paymentMethod', query.paymentMethod);

    return this.http.get<PaginatedResponse<FeePayment>>('/api/v1/fee-payments', { params });
  }

  get(id: string): Observable<ApiResponse<FeePayment>> {
    return this.http.get<ApiResponse<FeePayment>>(`/api/v1/fee-payments/${id}`);
  }

  create(data: CreateFeePaymentRequest): Observable<ApiResponse<FeePayment>> {
    return this.http.post<ApiResponse<FeePayment>>('/api/v1/fee-payments', data);
  }
}
