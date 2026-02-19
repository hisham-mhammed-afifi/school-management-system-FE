import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  FeeInvoice,
  CreateFeeInvoiceRequest,
  BulkGenerateInvoicesRequest,
  BulkGenerateInvoicesResponse,
  ListFeeInvoicesQuery,
} from '@core/models/fee-invoice';

@Injectable({ providedIn: 'root' })
export class FeeInvoiceService {
  private readonly http = inject(HttpClient);

  list(query: ListFeeInvoicesQuery = {}): Observable<PaginatedResponse<FeeInvoice>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.studentId) params = params.set('studentId', query.studentId);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<FeeInvoice>>('/api/v1/fee-invoices', { params });
  }

  get(id: string): Observable<ApiResponse<FeeInvoice>> {
    return this.http.get<ApiResponse<FeeInvoice>>(`/api/v1/fee-invoices/${id}`);
  }

  create(data: CreateFeeInvoiceRequest): Observable<ApiResponse<FeeInvoice>> {
    return this.http.post<ApiResponse<FeeInvoice>>('/api/v1/fee-invoices', data);
  }

  bulkGenerate(
    data: BulkGenerateInvoicesRequest,
  ): Observable<ApiResponse<BulkGenerateInvoicesResponse>> {
    return this.http.post<ApiResponse<BulkGenerateInvoicesResponse>>(
      '/api/v1/fee-invoices/bulk-generate',
      data,
    );
  }

  issue(id: string, notifyGuardian = false): Observable<ApiResponse<FeeInvoice>> {
    return this.http.post<ApiResponse<FeeInvoice>>(`/api/v1/fee-invoices/${id}/issue`, {
      notifyGuardian,
    });
  }

  cancel(id: string, reason?: string): Observable<ApiResponse<FeeInvoice>> {
    return this.http.post<ApiResponse<FeeInvoice>>(`/api/v1/fee-invoices/${id}/cancel`, {
      reason,
    });
  }
}
