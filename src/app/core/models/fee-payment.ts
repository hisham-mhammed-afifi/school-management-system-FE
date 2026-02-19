export type PaymentMethod = 'cash' | 'bank_transfer' | 'card' | 'cheque' | 'online';

export interface FeePayment {
  id: string;
  schoolId: string;
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
  invoice?: { id: string; invoiceNumber: string };
}

export interface CreateFeePaymentRequest {
  invoiceId: string;
  amountPaid: number;
  paymentDate: string;
  paymentMethod: PaymentMethod;
  referenceNumber?: string;
  notes?: string;
}

export interface ListFeePaymentsQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'paymentDate' | 'amountPaid';
  order?: 'asc' | 'desc';
  invoiceId?: string;
  paymentMethod?: PaymentMethod;
}
