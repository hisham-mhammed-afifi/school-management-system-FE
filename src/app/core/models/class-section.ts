export interface ClassSection {
  id: string;
  academicYearId: string;
  gradeId: string;
  name: string;
  capacity: number;
  homeroomTeacherId: string | null;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
  academicYear?: { id: string; name: string };
  grade?: { id: string; name: string };
  homeroomTeacher?: { id: string; firstName: string; lastName: string } | null;
}

export interface CreateClassSectionRequest {
  academicYearId: string;
  gradeId: string;
  name: string;
  capacity: number;
  homeroomTeacherId?: string;
}

export interface UpdateClassSectionRequest {
  name?: string;
  capacity?: number;
  homeroomTeacherId?: string | null;
}

export interface ListClassSectionsQuery {
  page?: number;
  limit?: number;
  academicYearId?: string;
  gradeId?: string;
}
