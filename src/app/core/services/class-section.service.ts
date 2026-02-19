import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  ClassSection,
  CreateClassSectionRequest,
  UpdateClassSectionRequest,
  ListClassSectionsQuery,
} from '@core/models/class-section';

@Injectable({ providedIn: 'root' })
export class ClassSectionService {
  private readonly http = inject(HttpClient);

  list(query: ListClassSectionsQuery = {}): Observable<PaginatedResponse<ClassSection>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.academicYearId) params = params.set('academicYearId', query.academicYearId);
    if (query.gradeId) params = params.set('gradeId', query.gradeId);

    return this.http.get<PaginatedResponse<ClassSection>>('/api/v1/class-sections', { params });
  }

  get(id: string): Observable<ApiResponse<ClassSection>> {
    return this.http.get<ApiResponse<ClassSection>>(`/api/v1/class-sections/${id}`);
  }

  create(data: CreateClassSectionRequest): Observable<ApiResponse<ClassSection>> {
    return this.http.post<ApiResponse<ClassSection>>('/api/v1/class-sections', data);
  }

  update(id: string, data: UpdateClassSectionRequest): Observable<ApiResponse<ClassSection>> {
    return this.http.patch<ApiResponse<ClassSection>>(`/api/v1/class-sections/${id}`, data);
  }

  delete(id: string): Observable<void> {
    return this.http.delete<void>(`/api/v1/class-sections/${id}`);
  }
}
