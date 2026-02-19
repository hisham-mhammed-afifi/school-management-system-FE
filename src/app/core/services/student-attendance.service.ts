import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  StudentAttendance,
  BulkStudentAttendanceRequest,
  CorrectStudentAttendanceRequest,
  ListStudentAttendanceQuery,
  AttendanceSummaryQuery,
  AttendanceSummary,
} from '@core/models/attendance';

@Injectable({ providedIn: 'root' })
export class StudentAttendanceService {
  private readonly http = inject(HttpClient);

  list(query: ListStudentAttendanceQuery = {}): Observable<PaginatedResponse<StudentAttendance>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.classSectionId) params = params.set('classSectionId', query.classSectionId);
    if (query.studentId) params = params.set('studentId', query.studentId);
    if (query.date) params = params.set('date', query.date);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<StudentAttendance>>('/api/v1/student-attendance', {
      params,
    });
  }

  get(id: string): Observable<ApiResponse<StudentAttendance>> {
    return this.http.get<ApiResponse<StudentAttendance>>(`/api/v1/student-attendance/${id}`);
  }

  bulkRecord(data: BulkStudentAttendanceRequest): Observable<ApiResponse<StudentAttendance[]>> {
    return this.http.post<ApiResponse<StudentAttendance[]>>(
      '/api/v1/student-attendance/bulk',
      data,
    );
  }

  correct(
    id: string,
    data: CorrectStudentAttendanceRequest,
  ): Observable<ApiResponse<StudentAttendance>> {
    return this.http.patch<ApiResponse<StudentAttendance>>(
      `/api/v1/student-attendance/${id}`,
      data,
    );
  }

  summary(query: AttendanceSummaryQuery): Observable<ApiResponse<AttendanceSummary>> {
    let params = new HttpParams()
      .set('classSectionId', query.classSectionId)
      .set('dateFrom', query.dateFrom)
      .set('dateTo', query.dateTo);
    if (query.studentId) params = params.set('studentId', query.studentId);

    return this.http.get<ApiResponse<AttendanceSummary>>('/api/v1/student-attendance/summary', {
      params,
    });
  }
}
