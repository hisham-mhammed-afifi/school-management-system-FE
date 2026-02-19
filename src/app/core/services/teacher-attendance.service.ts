import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  TeacherAttendance,
  RecordTeacherAttendanceRequest,
  CorrectTeacherAttendanceRequest,
  ListTeacherAttendanceQuery,
} from '@core/models/attendance';

@Injectable({ providedIn: 'root' })
export class TeacherAttendanceService {
  private readonly http = inject(HttpClient);

  list(query: ListTeacherAttendanceQuery = {}): Observable<PaginatedResponse<TeacherAttendance>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.teacherId) params = params.set('teacherId', query.teacherId);
    if (query.date) params = params.set('date', query.date);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<TeacherAttendance>>('/api/v1/teacher-attendance', {
      params,
    });
  }

  get(id: string): Observable<ApiResponse<TeacherAttendance>> {
    return this.http.get<ApiResponse<TeacherAttendance>>(`/api/v1/teacher-attendance/${id}`);
  }

  record(data: RecordTeacherAttendanceRequest): Observable<ApiResponse<TeacherAttendance>> {
    return this.http.post<ApiResponse<TeacherAttendance>>('/api/v1/teacher-attendance', data);
  }

  correct(
    id: string,
    data: CorrectTeacherAttendanceRequest,
  ): Observable<ApiResponse<TeacherAttendance>> {
    return this.http.patch<ApiResponse<TeacherAttendance>>(
      `/api/v1/teacher-attendance/${id}`,
      data,
    );
  }
}
