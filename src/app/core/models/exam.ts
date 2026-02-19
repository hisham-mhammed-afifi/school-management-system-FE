export type ExamType = 'quiz' | 'midterm' | 'final' | 'assignment' | 'practical';

export interface ExamSubject {
  id: string;
  schoolId: string;
  examId: string;
  subjectId: string;
  gradeId: string;
  maxScore: number;
  passScore: number | null;
  examDate: string | null;
  examTime: string | null;
  subject?: { id: string; name: string; code: string };
  grade?: { id: string; name: string };
}

export interface Exam {
  id: string;
  schoolId: string;
  academicYearId: string;
  termId: string;
  gradingScaleId: string;
  name: string;
  examType: ExamType;
  weight: number;
  startDate: string | null;
  endDate: string | null;
  createdAt: string;
  updatedAt: string;
  examSubjects?: ExamSubject[];
  gradingScale?: { id: string; name: string };
  term?: { id: string; name: string };
  academicYear?: { id: string; name: string };
}

export interface CreateExamRequest {
  academicYearId: string;
  termId: string;
  gradingScaleId: string;
  name: string;
  examType: ExamType;
  weight?: number;
  startDate?: string;
  endDate?: string;
}

export interface UpdateExamRequest {
  name?: string;
  examType?: ExamType;
  weight?: number;
  gradingScaleId?: string;
  startDate?: string;
  endDate?: string;
}

export interface ListExamsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'startDate';
  order?: 'asc' | 'desc';
  termId?: string;
  examType?: ExamType;
}

export interface CreateExamSubjectRequest {
  subjectId: string;
  gradeId: string;
  maxScore: number;
  passScore?: number;
  examDate?: string;
  examTime?: string;
}

export interface UpdateExamSubjectRequest {
  maxScore?: number;
  passScore?: number;
  examDate?: string;
  examTime?: string;
}
