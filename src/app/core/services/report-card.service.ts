import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  ReportCard,
  GenerateReportCardsRequest,
  GenerateReportCardsResponse,
  UpdateReportCardRemarksRequest,
  ListReportCardsQuery,
} from '@core/models/report-card';

@Injectable({ providedIn: 'root' })
export class ReportCardService {
  private readonly http = inject(HttpClient);

  list(query: ListReportCardsQuery = {}): Observable<PaginatedResponse<ReportCard>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.termId) params = params.set('termId', query.termId);
    if (query.classSectionId) params = params.set('classSectionId', query.classSectionId);
    if (query.studentId) params = params.set('studentId', query.studentId);

    return this.http.get<PaginatedResponse<ReportCard>>('/api/v1/report-cards', { params });
  }

  get(id: string): Observable<ApiResponse<ReportCard>> {
    return this.http.get<ApiResponse<ReportCard>>(`/api/v1/report-cards/${id}`);
  }

  generate(data: GenerateReportCardsRequest): Observable<ApiResponse<GenerateReportCardsResponse>> {
    return this.http.post<ApiResponse<GenerateReportCardsResponse>>('/api/v1/report-cards', data);
  }

  updateRemarks(
    id: string,
    data: UpdateReportCardRemarksRequest,
  ): Observable<ApiResponse<ReportCard>> {
    return this.http.patch<ApiResponse<ReportCard>>(`/api/v1/report-cards/${id}/remarks`, data);
  }
}
