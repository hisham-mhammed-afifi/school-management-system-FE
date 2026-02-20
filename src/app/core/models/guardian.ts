export type RelationshipType =
  | 'father'
  | 'mother'
  | 'brother'
  | 'sister'
  | 'uncle'
  | 'aunt'
  | 'grandparent'
  | 'other';

export interface Guardian {
  id: string;
  schoolId: string;
  firstName: string;
  lastName: string;
  phone: string;
  email: string | null;
  nationalId: string | null;
  occupation: string | null;
  address: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ChildGradesQuery {
  page?: number;
  limit?: number;
  termId?: string;
  examId?: string;
}

export interface ChildAttendanceQuery {
  page?: number;
  limit?: number;
  from?: string;
  to?: string;
}

export interface ChildPaginationQuery {
  page?: number;
  limit?: number;
}
