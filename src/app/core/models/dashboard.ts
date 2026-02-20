export interface FeesSummary {
  outstanding: { amount: number; count: number };
  collected: { amount: number; count: number };
  overdue: { amount: number; count: number };
}

export interface DashboardOverview {
  students: number;
  teachers: number;
  classSections: number;
  attendanceToday: number;
  fees: FeesSummary;
}

export interface AttendanceByClass {
  classSectionId: string;
  className: string;
  total: number;
  present: number;
  absent: number;
  rate: number;
}

export interface RecentActivity {
  id: string;
  action: string;
  actor: string;
  resourceType: string;
  resourceId: string;
  changes: Record<string, unknown>;
  createdAt: string;
  schoolId: string;
  userId: string | null;
}

export interface PlatformDashboard {
  schoolCount: number;
  userCount: number;
}

export interface ExpiringSchool {
  id: string;
  name: string;
  subscriptionPlan: string;
  subscriptionExpiresAt: string;
}
