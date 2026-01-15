export type ClientCrmStatus = "LEAD" | "IN_PROGRESS" | "ACTIVE" | "INACTIVE";

export type Client = {
  id: string;
  organizationId: string;
  createdById?: string | null;

  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  notes?: string | null;

  // ✅ NEW
  crmStatus: ClientCrmStatus;
  tags: string[];

  createdAt?: string;
  updatedAt?: string;
};

export type ClientsListResponse = {
  clients: Client[];
};

export type ClientFormValues = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  address: string;
  notes: string;

  // ✅ NEW
  crmStatus: ClientCrmStatus;
  tags: string[];
};
