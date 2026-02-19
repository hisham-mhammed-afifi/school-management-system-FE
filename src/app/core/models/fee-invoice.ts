export type InvoiceStatus =
  | 'draft'
  | 'issued'
  | 'partially_paid'
  | 'paid'
  | 'overdue'
  | 'cancelled';

export interface InvoiceItem {
  id: string;
  feeStructureId: string;
  description: string | null;
  quantity: number;
  unitAmount: number;
  totalAmount: number;
  feeStructure?: { id: string; name: string };
}

export interface FeeInvoice {
  id: string;
  schoolId: string;
  studentId: string;
  invoiceNumber: string;
  dueDate: string;
  totalAmount: number;
  totalDiscountAmount: number;
  netAmount: number;
  paidAmount: number;
  status: InvoiceStatus;
  cancelReason: string | null;
  createdAt: string;
  updatedAt: string;
  student?: { id: string; firstName: string; lastName: string; studentCode: string };
  items?: InvoiceItem[];
}

export interface CreateInvoiceItemRequest {
  feeStructureId: string;
  description?: string;
  quantity?: number;
  unitAmount: number;
}

export interface CreateFeeInvoiceRequest {
  studentId: string;
  dueDate: string;
  items: CreateInvoiceItemRequest[];
}

export interface BulkGenerateInvoicesRequest {
  academicYearId: string;
  gradeId: string;
  dueDate: string;
  feeStructureIds: string[];
}

export interface BulkGenerateInvoicesResponse {
  totalCreated: number;
  totalNet: number;
  skipped: { studentId: string; reason: string }[];
}

export interface ListFeeInvoicesQuery {
  page?: number;
  limit?: number;
  sortBy?: 'createdAt' | 'dueDate' | 'netAmount';
  order?: 'asc' | 'desc';
  studentId?: string;
  status?: InvoiceStatus;
}
