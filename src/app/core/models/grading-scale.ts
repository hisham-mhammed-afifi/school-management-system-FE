export interface GradingScaleLevel {
  id: string;
  gradingScaleId: string;
  letter: string;
  minScore: number;
  maxScore: number;
  gpaPoints: number | null;
  orderIndex: number;
}

export interface GradingScale {
  id: string;
  schoolId: string;
  name: string;
  levels: GradingScaleLevel[];
  createdAt: string;
  updatedAt: string;
}

export interface CreateGradingScaleLevelRequest {
  letter: string;
  minScore: number;
  maxScore: number;
  gpaPoints?: number;
  orderIndex: number;
}

export interface CreateGradingScaleRequest {
  name: string;
  levels: CreateGradingScaleLevelRequest[];
}

export interface UpdateGradingScaleRequest {
  name?: string;
  levels?: CreateGradingScaleLevelRequest[];
}

export interface ListGradingScalesQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'name';
  order?: 'asc' | 'desc';
}
