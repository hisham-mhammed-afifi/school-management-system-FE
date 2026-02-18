export type Gender = 'male' | 'female';

export type StudentStatus = 'active' | 'graduated' | 'withdrawn' | 'suspended' | 'transferred';

export type BloodType =
  | 'A_POS'
  | 'A_NEG'
  | 'B_POS'
  | 'B_NEG'
  | 'AB_POS'
  | 'AB_NEG'
  | 'O_POS'
  | 'O_NEG';

export interface Student {
  id: string;
  studentCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId: string | null;
  nationality: string | null;
  religion: string | null;
  bloodType: BloodType | null;
  address: string | null;
  phone: string | null;
  email: string | null;
  photoUrl: string | null;
  medicalNotes: string | null;
  admissionDate: string;
  status: StudentStatus;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateStudentRequest {
  studentCode: string;
  firstName: string;
  lastName: string;
  dateOfBirth: string;
  gender: Gender;
  nationalId?: string;
  nationality?: string;
  religion?: string;
  bloodType?: BloodType;
  address?: string;
  phone?: string;
  email?: string;
  photoUrl?: string;
  medicalNotes?: string;
  admissionDate: string;
}

export interface UpdateStudentRequest {
  firstName?: string;
  lastName?: string;
  dateOfBirth?: string;
  gender?: Gender;
  nationalId?: string | null;
  nationality?: string | null;
  religion?: string | null;
  bloodType?: BloodType | null;
  address?: string | null;
  phone?: string | null;
  email?: string | null;
  photoUrl?: string | null;
  medicalNotes?: string | null;
  status?: StudentStatus;
}

export interface ListStudentsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'firstName' | 'lastName' | 'studentCode';
  order?: 'asc' | 'desc';
  status?: StudentStatus;
  gradeId?: string;
  classSectionId?: string;
  search?: string;
}
