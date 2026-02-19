export interface FeeCategory {
  id: string;
  schoolId: string;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFeeCategoryRequest {
  name: string;
}

export interface UpdateFeeCategoryRequest {
  name?: string;
}

export interface ListFeeCategoriesQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name';
  order?: 'asc' | 'desc';
}
