import type { Gender } from '@core/models/student';

export type TeacherStatus = 'active' | 'on_leave' | 'resigned' | 'terminated';

export interface Teacher {
  id: string;
  teacherCode: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  nationalId: string | null;
  phone: string | null;
  email: string | null;
  specialization: string | null;
  qualification: string | null;
  photoUrl: string | null;
  hireDate: string;
  departmentId: string | null;
  status: TeacherStatus;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTeacherRequest {
  teacherCode: string;
  firstName: string;
  lastName: string;
  gender: Gender;
  nationalId?: string;
  phone?: string;
  email?: string;
  specialization?: string;
  qualification?: string;
  photoUrl?: string;
  hireDate: string;
  departmentId?: string | null;
}

export interface UpdateTeacherRequest {
  firstName?: string;
  lastName?: string;
  gender?: Gender;
  nationalId?: string | null;
  phone?: string | null;
  email?: string | null;
  specialization?: string | null;
  qualification?: string | null;
  photoUrl?: string | null;
  departmentId?: string | null;
  status?: TeacherStatus;
}

export interface ListTeachersQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'teacherCode';
  order?: 'asc' | 'desc';
  status?: TeacherStatus;
  departmentId?: string;
  search?: string;
}
