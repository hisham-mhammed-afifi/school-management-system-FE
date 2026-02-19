export type Recurrence = 'monthly' | 'quarterly' | 'term' | 'annual';

export interface FeeStructure {
  id: string;
  schoolId: string;
  academicYearId: string;
  gradeId: string;
  feeCategoryId: string;
  name: string;
  amount: number;
  dueDate: string | null;
  isRecurring: boolean;
  recurrence: Recurrence | null;
  createdAt: string;
  updatedAt: string;
  academicYear?: { id: string; name: string };
  grade?: { id: string; name: string };
  feeCategory?: { id: string; name: string };
}

export interface CreateFeeStructureRequest {
  academicYearId: string;
  gradeId: string;
  feeCategoryId: string;
  name: string;
  amount: number;
  dueDate?: string;
  isRecurring?: boolean;
  recurrence?: Recurrence;
}

export interface UpdateFeeStructureRequest {
  name?: string;
  amount?: number;
  dueDate?: string;
  isRecurring?: boolean;
  recurrence?: Recurrence;
}

export interface ListFeeStructuresQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name' | 'amount';
  order?: 'asc' | 'desc';
  academicYearId?: string;
  gradeId?: string;
  feeCategoryId?: string;
  isRecurring?: boolean;
}
