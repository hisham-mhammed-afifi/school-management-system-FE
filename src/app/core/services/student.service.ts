import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  Student,
  CreateStudentRequest,
  UpdateStudentRequest,
  ListStudentsQuery,
} from '@core/models/student';

@Injectable({ providedIn: 'root' })
export class StudentService {
  private readonly http = inject(HttpClient);

  list(query: ListStudentsQuery = {}): Observable<PaginatedResponse<Student>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.status) params = params.set('status', query.status);
    if (query.gradeId) params = params.set('gradeId', query.gradeId);
    if (query.classSectionId) params = params.set('classSectionId', query.classSectionId);
    if (query.search) params = params.set('search', query.search);

    return this.http.get<PaginatedResponse<Student>>('/api/v1/students', { params });
  }

  get(id: string): Observable<ApiResponse<Student>> {
    return this.http.get<ApiResponse<Student>>(`/api/v1/students/${id}`);
  }

  create(data: CreateStudentRequest): Observable<ApiResponse<Student>> {
    return this.http.post<ApiResponse<Student>>('/api/v1/students', data);
  }

  update(id: string, data: UpdateStudentRequest): Observable<ApiResponse<Student>> {
    return this.http.patch<ApiResponse<Student>>(`/api/v1/students/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/students/${id}`);
  }
}
