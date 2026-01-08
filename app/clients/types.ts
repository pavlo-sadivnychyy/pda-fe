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
  createdAt?: string;
  updatedAt?: string;
};

export type ClientFormValues = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  address: string;
  notes: string;
};

export type ClientsListResponse = {
  clients: Client[];
};
