import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse, PaginatedResponse } from '@core/models/api';
import type {
  PeriodSet,
  Period,
  WorkingDay,
  ClassTimetableResponse,
  TeacherTimetableResponse,
  RoomTimetableResponse,
  ListPeriodSetsQuery,
} from '@core/models/timetable';

@Injectable({ providedIn: 'root' })
export class TimetableService {
  private readonly http = inject(HttpClient);

  listPeriodSets(query: ListPeriodSetsQuery = {}): Observable<PaginatedResponse<PeriodSet>> {
    let params = new HttpParams();
    if (query.page) params = params.set('page', query.page);
    if (query.limit) params = params.set('limit', query.limit);
    if (query.academicYearId) params = params.set('academicYearId', query.academicYearId);

    return this.http.get<PaginatedResponse<PeriodSet>>('/api/v1/period-sets', { params });
  }

  getPeriods(periodSetId: string): Observable<ApiResponse<Period[]>> {
    return this.http.get<ApiResponse<Period[]>>(`/api/v1/period-sets/${periodSetId}/periods`);
  }

  getWorkingDays(periodSetId: string): Observable<ApiResponse<WorkingDay[]>> {
    return this.http.get<ApiResponse<WorkingDay[]>>(
      `/api/v1/period-sets/${periodSetId}/working-days`,
    );
  }

  getClassTimetable(
    classSectionId: string,
    termId: string,
  ): Observable<ApiResponse<ClassTimetableResponse>> {
    const params = new HttpParams().set('termId', termId);
    return this.http.get<ApiResponse<ClassTimetableResponse>>(
      `/api/v1/timetable/class/${classSectionId}`,
      { params },
    );
  }

  getTeacherTimetable(
    teacherId: string,
    termId: string,
  ): Observable<ApiResponse<TeacherTimetableResponse>> {
    const params = new HttpParams().set('termId', termId);
    return this.http.get<ApiResponse<TeacherTimetableResponse>>(
      `/api/v1/timetable/teacher/${teacherId}`,
      { params },
    );
  }

  getRoomTimetable(roomId: string, termId: string): Observable<ApiResponse<RoomTimetableResponse>> {
    const params = new HttpParams().set('termId', termId);
    return this.http.get<ApiResponse<RoomTimetableResponse>>(`/api/v1/timetable/room/${roomId}`, {
      params,
    });
  }
}
