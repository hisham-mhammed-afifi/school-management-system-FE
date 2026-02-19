export type StudentAttendanceStatus = 'present' | 'absent' | 'late' | 'excused';
export type TeacherAttendanceStatus = 'present' | 'absent' | 'late' | 'on_leave';

export interface StudentAttendance {
  id: string;
  schoolId: string;
  studentId: string;
  classSectionId: string;
  date: string;
  lessonId: string | null;
  status: StudentAttendanceStatus;
  recordedBy: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; studentCode: string; firstName: string; lastName: string };
  classSection?: { id: string; name: string };
  lesson?: { id: string } | null;
  recordedByUser?: { id: string; email: string };
}

export interface TeacherAttendance {
  id: string;
  schoolId: string;
  teacherId: string;
  date: string;
  checkIn: string | null;
  checkOut: string | null;
  status: TeacherAttendanceStatus;
  createdAt: string;
  updatedAt: string;
  teacher?: { id: string; teacherCode: string; firstName: string; lastName: string };
}

export interface BulkStudentAttendanceRecord {
  studentId: string;
  status: StudentAttendanceStatus;
  notes?: string;
}

export interface BulkStudentAttendanceRequest {
  classSectionId: string;
  date: string;
  lessonId?: string;
  records: BulkStudentAttendanceRecord[];
}

export interface CorrectStudentAttendanceRequest {
  status: StudentAttendanceStatus;
  notes?: string;
}

export interface RecordTeacherAttendanceRequest {
  teacherId: string;
  date: string;
  status: TeacherAttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export interface CorrectTeacherAttendanceRequest {
  status?: TeacherAttendanceStatus;
  checkIn?: string;
  checkOut?: string;
}

export interface ListStudentAttendanceQuery {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'createdAt';
  order?: 'asc' | 'desc';
  classSectionId?: string;
  studentId?: string;
  date?: string;
  status?: StudentAttendanceStatus;
}

export interface ListTeacherAttendanceQuery {
  page?: number;
  limit?: number;
  sortBy?: 'date' | 'createdAt';
  order?: 'asc' | 'desc';
  teacherId?: string;
  date?: string;
  status?: TeacherAttendanceStatus;
}

export interface AttendanceSummaryQuery {
  classSectionId: string;
  dateFrom: string;
  dateTo: string;
  studentId?: string;
}

export interface AttendanceSummaryStudent {
  studentId: string;
  present: number;
  absent: number;
  late: number;
  excused: number;
  total: number;
  attendanceRate: number;
}

export interface AttendanceSummary {
  students: AttendanceSummaryStudent[];
}
