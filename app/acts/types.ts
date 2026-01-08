export type ActStatus = "DRAFT" | "SENT" | "SIGNED" | "CANCELLED";

export type Client = {
  id: string;
  name: string;
  contactName?: string | null;
};

export type Invoice = {
  id: string;
  number: string;
  issueDate: string;
  client?: Client | null;
  total: string;
  currency: string;
};

export type Act = {
  id: string;
  organizationId: string;
  clientId: string;
  createdById: string;
  number: string;
  title?: string | null;
  periodFrom?: string | null;
  periodTo?: string | null;
  total: string;
  currency: string;
  status: ActStatus;
  notes?: string | null;
  relatedInvoiceId?: string | null;
  client?: Client | null;
  relatedInvoice?: Invoice | null;
  createdAt: string;
};

export type ActsListResponse = {
  items: Act[];
};

// ⚠️ Узгоджуємо з твоїм беком інвойсів: у тебе в invoices.controller.ts => return { invoices }
export type InvoicesListResponse = {
  invoices: Invoice[];
};

export type CreateActFromInvoicePayload = {
  invoiceId: string;
  number: string;
  title?: string;
  periodFrom?: string;
  periodTo?: string;
  notes?: string;
  createdById: string;
};
