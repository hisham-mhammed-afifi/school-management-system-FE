export interface Grade {
  id: string;
  name: string;
  levelOrder: number;
  schoolId: string;
  createdAt: string;
  updatedAt: string;
}

export interface ListGradesQuery {
  page?: number;
  limit?: number;
}
