import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Subject,
  CreateSubjectRequest,
  UpdateSubjectRequest,
  ListSubjectsQuery,
} from '@core/models/subject';

@Injectable({ providedIn: 'root' })
export class SubjectService {
  private readonly http = inject(HttpClient);

  list(query: ListSubjectsQuery = {}): Observable<PaginatedResponse<Subject>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.search) params = params.set('search', query.search);
    if (query.gradeId) params = params.set('gradeId', query.gradeId);

    return this.http.get<PaginatedResponse<Subject>>('/api/v1/subjects', { params });
  }

  get(id: string): Observable<ApiResponse<Subject>> {
    return this.http.get<ApiResponse<Subject>>(`/api/v1/subjects/${id}`);
  }

  create(data: CreateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.http.post<ApiResponse<Subject>>('/api/v1/subjects', data);
  }

  update(id: string, data: UpdateSubjectRequest): Observable<ApiResponse<Subject>> {
    return this.http.patch<ApiResponse<Subject>>(`/api/v1/subjects/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/subjects/${id}`);
  }

  setGrades(
    subjectId: string,
    gradeIds: string[],
  ): Observable<ApiResponse<{ subjectId: string; assignedCount: number }>> {
    return this.http.put<ApiResponse<{ subjectId: string; assignedCount: number }>>(
      `/api/v1/subjects/${subjectId}/grades`,
      { gradeIds },
    );
  }
}
