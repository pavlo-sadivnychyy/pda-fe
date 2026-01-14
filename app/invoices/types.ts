export type Client = {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  notes?: string | null;
};

export type InvoiceStatus = "DRAFT" | "SENT" | "PAID" | "OVERDUE" | "CANCELLED";

export type InvoiceItemForm = {
  name: string;
  description: string;
  quantity: string;
  unitPrice: string;
  taxRate: string;
};

export type Invoice = {
  id: string;
  organizationId: string;
  createdById: string;
  clientId?: string | null;
  number: string;
  issueDate: string;
  dueDate?: string | null;
  currency: string;
  subtotal: string | number;
  taxAmount?: string | number | null;
  total: string | number;
  status: InvoiceStatus;
  notes?: string | null;
  pdfDocumentId?: string | null;
  createdAt: string;
  updatedAt: string;
  client?: Client | null;
  items: {
    id: string;
    name: string;
    description?: string | null;
    quantity: number;
    unitPrice: number;
    taxRate?: number | null;
    lineTotal: number;
  }[];
};

export const defaultItem: InvoiceItemForm = {
  name: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
  taxRate: "0",
};

export const statuses: Record<InvoiceStatus, string> = {
  SENT: "Відправлено",
  PAID: "Оплачено",
  CANCELLED: "Скасовано",
  OVERDUE: "Протерміновано",
  DRAFT: "Чернетка",
};

export type InvoiceCreateFormState = {
  clientId: string;
  issueDate: string;
  dueDate: string;
  currency: string;
  notes: string;
  items: InvoiceItemForm[];
};

export type CreateInvoicePayload = {
  organizationId: string;
  createdById: string;
  clientId?: string;
  issueDate?: string;
  dueDate?: string;
  currency: string;
  notes?: string;
  status: InvoiceStatus;
  items: {
    name: string;
    description?: string;
    quantity: number;
    unitPrice: number;
    taxRate?: number;
  }[];
};

export type InvoiceAction =
  | "send-ua"
  | "send-international"
  | "mark-paid"
  | "cancel";
