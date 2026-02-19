export type EnrollmentStatus = 'active' | 'withdrawn' | 'transferred' | 'promoted';

export interface Enrollment {
  id: string;
  schoolId: string;
  studentId: string;
  classSectionId: string;
  academicYearId: string;
  enrolledAt: string;
  withdrawnAt: string | null;
  status: EnrollmentStatus;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; studentCode: string; firstName: string; lastName: string };
  classSection?: { id: string; name: string };
  academicYear?: { id: string; name: string };
}

export interface ListEnrollmentsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'enrolledAt';
  order?: 'asc' | 'desc';
  status?: EnrollmentStatus;
  academicYearId?: string;
  classSectionId?: string;
  studentId?: string;
}
