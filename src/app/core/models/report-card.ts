export interface ReportCard {
  id: string;
  schoolId: string;
  studentId: string;
  academicYearId: string;
  termId: string;
  classSectionId: string;
  snapshotData: unknown;
  overallGpa: number | null;
  overallPercentage: number | null;
  rankInClass: number | null;
  teacherRemarks: string | null;
  generatedBy: string;
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string; studentCode: string };
  term?: { id: string; name: string };
  classSection?: { id: string; name: string };
  academicYear?: { id: string; name: string };
}

export interface GenerateReportCardsRequest {
  termId: string;
  classSectionId: string;
}

export interface GenerateReportCardsResponse {
  generated: number;
  missingGrades: number;
  skippedExisting: number;
}

export interface UpdateReportCardRemarksRequest {
  teacherRemarks?: string;
  rankInClass?: number;
}

export interface ListReportCardsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'generatedAt' | 'overallPercentage' | 'rankInClass';
  order?: 'asc' | 'desc';
  termId?: string;
  classSectionId?: string;
  studentId?: string;
}
