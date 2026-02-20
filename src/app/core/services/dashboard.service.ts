import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

import type { ApiResponse } from '@core/models/api';
import type {
  DashboardOverview,
  AttendanceByClass,
  FeesSummary,
  RecentActivity,
  PlatformDashboard,
  ExpiringSchool,
} from '@core/models/dashboard';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private readonly http = inject(HttpClient);

  overview(): Observable<ApiResponse<DashboardOverview>> {
    return this.http.get<ApiResponse<DashboardOverview>>('/api/v1/dashboard/overview');
  }

  attendanceToday(date?: string): Observable<ApiResponse<AttendanceByClass[]>> {
    let params = new HttpParams();
    if (date) params = params.set('date', date);
    return this.http.get<ApiResponse<AttendanceByClass[]>>('/api/v1/dashboard/attendance-today', {
      params,
    });
  }

  feesSummary(academicYearId?: string): Observable<ApiResponse<FeesSummary>> {
    let params = new HttpParams();
    if (academicYearId) params = params.set('academicYearId', academicYearId);
    return this.http.get<ApiResponse<FeesSummary>>('/api/v1/dashboard/fees-summary', { params });
  }

  recentActivity(): Observable<ApiResponse<RecentActivity[]>> {
    return this.http.get<ApiResponse<RecentActivity[]>>('/api/v1/dashboard/recent-activity');
  }

  platformOverview(): Observable<ApiResponse<PlatformDashboard>> {
    return this.http.get<ApiResponse<PlatformDashboard>>('/api/v1/platform/dashboard');
  }

  expiringSchools(days?: number): Observable<ApiResponse<ExpiringSchool[]>> {
    let params = new HttpParams();
    if (days) params = params.set('days', days);
    return this.http.get<ApiResponse<ExpiringSchool[]>>('/api/v1/platform/schools/expiring', {
      params,
    });
  }
}
