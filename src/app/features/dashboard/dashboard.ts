import { Component, inject, signal, OnInit } from '@angular/core';
import { DecimalPipe, DatePipe } from '@angular/common';
import { TranslatePipe } from '@ngx-translate/core';
import { IconComponent } from '@shared/components/icon/icon';

import { AuthService } from '@core/services/auth.service';
import { SchoolService } from '@core/services/school.service';
import { DashboardService } from '@core/services/dashboard.service';
import type {
  DashboardOverview,
  AttendanceByClass,
  FeesSummary,
  RecentActivity,
  PlatformDashboard,
  ExpiringSchool,
} from '@core/models/dashboard';

@Component({
  selector: 'app-dashboard',
  imports: [TranslatePipe, DecimalPipe, DatePipe, IconComponent],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.css',
})
export class DashboardComponent implements OnInit {
  private readonly authService = inject(AuthService);
  private readonly schoolService = inject(SchoolService);
  private readonly dashboardService = inject(DashboardService);

  readonly user = this.authService.user;
  readonly isSuperAdmin = this.schoolService.isSuperAdmin;

  // School dashboard
  readonly overview = signal<DashboardOverview | null>(null);
  readonly attendance = signal<AttendanceByClass[]>([]);
  readonly fees = signal<FeesSummary | null>(null);
  readonly activity = signal<RecentActivity[]>([]);

  // Platform dashboard (super admin)
  readonly platformOverview = signal<PlatformDashboard | null>(null);
  readonly expiringSchools = signal<ExpiringSchool[]>([]);

  // Loading states
  readonly overviewLoading = signal(true);
  readonly attendanceLoading = signal(true);
  readonly feesLoading = signal(true);
  readonly activityLoading = signal(true);

  // Error states
  readonly overviewError = signal(false);
  readonly attendanceError = signal(false);
  readonly feesError = signal(false);
  readonly activityError = signal(false);

  ngOnInit(): void {
    if (this.isSuperAdmin() && !this.schoolService.currentSchoolId()) {
      this.loadPlatformDashboard();
    } else {
      this.loadSchoolDashboard();
    }
  }

  private loadSchoolDashboard(): void {
    this.dashboardService.overview().subscribe({
      next: (res) => {
        this.overview.set(res.data);
        this.overviewLoading.set(false);
      },
      error: () => {
        this.overviewError.set(true);
        this.overviewLoading.set(false);
      },
    });

    this.dashboardService.attendanceToday().subscribe({
      next: (res) => {
        this.attendance.set(res.data);
        this.attendanceLoading.set(false);
      },
      error: () => {
        this.attendanceError.set(true);
        this.attendanceLoading.set(false);
      },
    });

    this.dashboardService.feesSummary().subscribe({
      next: (res) => {
        this.fees.set(res.data);
        this.feesLoading.set(false);
      },
      error: () => {
        this.feesError.set(true);
        this.feesLoading.set(false);
      },
    });

    this.dashboardService.recentActivity().subscribe({
      next: (res) => {
        this.activity.set(res.data);
        this.activityLoading.set(false);
      },
      error: () => {
        this.activityError.set(true);
        this.activityLoading.set(false);
      },
    });
  }

  private loadPlatformDashboard(): void {
    this.dashboardService.platformOverview().subscribe({
      next: (res) => {
        this.platformOverview.set(res.data);
        this.overviewLoading.set(false);
      },
      error: () => {
        this.overviewError.set(true);
        this.overviewLoading.set(false);
      },
    });

    this.dashboardService.expiringSchools().subscribe({
      next: (res) => {
        this.expiringSchools.set(res.data);
        this.attendanceLoading.set(false);
      },
      error: () => {
        this.attendanceError.set(true);
        this.attendanceLoading.set(false);
      },
    });

    this.feesLoading.set(false);
    this.activityLoading.set(false);
  }
}
