export type UserService = {
  id: string;
  name: string;
  description: string | null;
  price: string; // Decimal as string from backend
  createdAt?: string;
  updatedAt?: string;
};

export type ServicesListResponse = {
  services: UserService[];
};

export type ServiceFormValues = {
  name: string;
  description: string;
  price: string; // input value
};
