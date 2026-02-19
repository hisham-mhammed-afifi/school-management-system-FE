export interface StudentGrade {
  id: string;
  schoolId: string;
  studentId: string;
  examSubjectId: string;
  score: number;
  gradeLetter: string | null;
  gradedBy: string;
  gradedAt: string;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string; studentCode: string };
  examSubject?: {
    id: string;
    maxScore: number;
    subject?: { id: string; name: string };
    exam?: { id: string; name: string };
  };
}

export interface BulkRecordGradesRequest {
  examSubjectId: string;
  grades: {
    studentId: string;
    score: number;
    notes?: string;
  }[];
}

export interface CorrectGradeRequest {
  score?: number;
  notes?: string;
}

export interface ListStudentGradesQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'score';
  order?: 'asc' | 'desc';
  examSubjectId?: string;
  studentId?: string;
}

export interface GradeReportStudent {
  studentId: string;
  firstName: string;
  lastName: string;
  studentCode: string;
  subjects: {
    subjectName: string;
    score: number;
    maxScore: number;
    percentage: number;
    gradeLetter: string | null;
  }[];
  overallPercentage: number;
  gpa: number | null;
}

export interface GradeReport {
  students: GradeReportStudent[];
  statistics: {
    averageScore: number;
    passRate: number;
  };
}

export interface GradeReportQuery {
  termId: string;
  classSectionId: string;
}
