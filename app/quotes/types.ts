export type QuoteStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED"
  | "CONVERTED";

export type QuoteAction = "send" | "accept" | "reject" | "expire";

export type Client = {
  id: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  address?: string | null;
  taxNumber?: string | null;
};

export type Quote = {
  id: string;
  number: string;
  issueDate: string;
  validUntil?: string | null;
  currency: string;
  status: QuoteStatus;
  total: any; // backend Decimal -> string/number
  clientId?: string | null;
  convertedInvoiceId?: string | null;
};
