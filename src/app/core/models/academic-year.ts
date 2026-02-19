export interface AcademicYear {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListAcademicYearsQuery {
  page?: number;
  limit?: number;
  isActive?: boolean;
}
