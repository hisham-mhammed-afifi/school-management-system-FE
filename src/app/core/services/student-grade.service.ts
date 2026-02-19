import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  StudentGrade,
  BulkRecordGradesRequest,
  CorrectGradeRequest,
  ListStudentGradesQuery,
  GradeReport,
  GradeReportQuery,
} from '@core/models/student-grade';

@Injectable({ providedIn: 'root' })
export class StudentGradeService {
  private readonly http = inject(HttpClient);

  list(query: ListStudentGradesQuery = {}): Observable<PaginatedResponse<StudentGrade>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.sortBy) params = params.set('sortBy', query.sortBy);
    if (query.order) params = params.set('order', query.order);
    if (query.examSubjectId) params = params.set('examSubjectId', query.examSubjectId);
    if (query.studentId) params = params.set('studentId', query.studentId);

    return this.http.get<PaginatedResponse<StudentGrade>>('/api/v1/student-grades', { params });
  }

  bulkRecord(data: BulkRecordGradesRequest): Observable<ApiResponse<StudentGrade[]>> {
    return this.http.post<ApiResponse<StudentGrade[]>>('/api/v1/student-grades/bulk', data);
  }

  correct(id: string, data: CorrectGradeRequest): Observable<ApiResponse<StudentGrade>> {
    return this.http.patch<ApiResponse<StudentGrade>>(`/api/v1/student-grades/${id}`, data);
  }

  report(query: GradeReportQuery): Observable<ApiResponse<GradeReport>> {
    const params = new HttpParams()
      .set('termId', query.termId)
      .set('classSectionId', query.classSectionId);

    return this.http.get<ApiResponse<GradeReport>>('/api/v1/student-grades/report', { params });
  }
}
