import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { PaginatedResponse } from '@core/models/api';
import type { Student } from '@core/models/student';
import type { StudentGrade } from '@core/models/student-grade';
import type { StudentAttendance } from '@core/models/attendance';
import type { ReportCard } from '@core/models/report-card';
import type { FeeInvoice } from '@core/models/fee-invoice';
import type {
  ChildGradesQuery,
  ChildAttendanceQuery,
  ChildPaginationQuery,
} from '@core/models/guardian';

@Injectable({ providedIn: 'root' })
export class GuardianPortalService {
  private readonly http = inject(HttpClient);

  listChildren(): Observable<PaginatedResponse<Student>> {
    return this.http.get<PaginatedResponse<Student>>('/api/v1/my/children');
  }

  listChildGrades(
    studentId: string,
    query: ChildGradesQuery = {},
  ): Observable<PaginatedResponse<StudentGrade>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.termId) params = params.set('termId', query.termId);
    if (query.examId) params = params.set('examId', query.examId);

    return this.http.get<PaginatedResponse<StudentGrade>>(
      `/api/v1/my/children/${studentId}/grades`,
      { params },
    );
  }

  listChildAttendance(
    studentId: string,
    query: ChildAttendanceQuery = {},
  ): Observable<PaginatedResponse<StudentAttendance>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.from) params = params.set('from', query.from);
    if (query.to) params = params.set('to', query.to);

    return this.http.get<PaginatedResponse<StudentAttendance>>(
      `/api/v1/my/children/${studentId}/attendance`,
      { params },
    );
  }

  listChildReportCards(
    studentId: string,
    query: ChildPaginationQuery = {},
  ): Observable<PaginatedResponse<ReportCard>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<PaginatedResponse<ReportCard>>(
      `/api/v1/my/children/${studentId}/report-cards`,
      { params },
    );
  }

  listChildInvoices(
    studentId: string,
    query: ChildPaginationQuery = {},
  ): Observable<PaginatedResponse<FeeInvoice>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);

    return this.http.get<PaginatedResponse<FeeInvoice>>(
      `/api/v1/my/children/${studentId}/invoices`,
      { params },
    );
  }
}
