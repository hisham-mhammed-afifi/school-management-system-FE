import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Teacher,
  CreateTeacherRequest,
  UpdateTeacherRequest,
  ListTeachersQuery,
} from '@core/models/teacher';

@Injectable({ providedIn: 'root' })
export class TeacherService {
  private readonly http = inject(HttpClient);

  list(query: ListTeachersQuery = {}): Observable<PaginatedResponse<Teacher>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.status) params = params.set('status', query.status);
    if (query.departmentId) params = params.set('departmentId', query.departmentId);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Teacher>>('/api/v1/teachers', { params });
  }

  get(id: string): Observable<ApiResponse<Teacher>> {
    return this.http.get<ApiResponse<Teacher>>(`/api/v1/teachers/${id}`);
  }

  create(data: CreateTeacherRequest): Observable<ApiResponse<Teacher>> {
    return this.http.post<ApiResponse<Teacher>>('/api/v1/teachers', data);
  }

  update(id: string, data: UpdateTeacherRequest): Observable<ApiResponse<Teacher>> {
    return this.http.patch<ApiResponse<Teacher>>(`/api/v1/teachers/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/teachers/${id}`);
  }
}
