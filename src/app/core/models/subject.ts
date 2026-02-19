export interface SubjectGrade {
  gradeId: string;
  grade: { id: string; name: string };
}

export interface Subject {
  id: string;
  schoolId: string;
  name: string;
  code: string;
  isLab: boolean;
  isElective: boolean;
  createdAt: string;
  updatedAt: string;
  subjectGrades: SubjectGrade[];
}

export interface CreateSubjectRequest {
  name: string;
  code: string;
  isLab?: boolean;
  isElective?: boolean;
}

export interface UpdateSubjectRequest {
  name?: string;
  code?: string;
  isLab?: boolean;
  isElective?: boolean;
}

export interface ListSubjectsQuery {
  page?: number;
  limit?: number;
  search?: string;
  gradeId?: string;
}
