export type DiscountType = 'percentage' | 'fixed';

export interface FeeDiscount {
  id: string;
  schoolId: string;
  studentId: string;
  feeStructureId: string;
  discountType: DiscountType;
  amount: number;
  reason: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string; studentCode: string };
  feeStructure?: { id: string; name: string };
}

export interface CreateFeeDiscountRequest {
  studentId: string;
  feeStructureId: string;
  discountType: DiscountType;
  amount: number;
  reason?: string;
}

export interface UpdateFeeDiscountRequest {
  discountType?: DiscountType;
  amount?: number;
  reason?: string;
}

export interface ListFeeDiscountsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt';
  order?: 'asc' | 'desc';
  studentId?: string;
  feeStructureId?: string;
}
