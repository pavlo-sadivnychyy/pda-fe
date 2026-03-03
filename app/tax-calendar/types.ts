export type TaxJurisdiction = "UA";
export type TaxEntityType = "FOP" | "LLC" | "OTHER";
export type TaxEventKind = "REPORT" | "PAYMENT" | "TASK";
export type TaxEventStatus =
  | "UPCOMING"
  | "IN_PROGRESS"
  | "DONE"
  | "SKIPPED"
  | "OVERDUE";

export type TaxProfile = {
  id: string;
  organizationId: string;
  createdById: string;
  jurisdiction: TaxJurisdiction;
  entityType: TaxEntityType;
  settings: any;
  timezone?: string | null;
  createdAt: string;
  updatedAt: string;
};

export type TaxEventTemplate = {
  id: string;
  organizationId: string;
  profileId: string;
  createdById: string;
  title: string;
  description?: string | null;
  kind: TaxEventKind;
  rrule: string;
  dueOffsetDays: number;
  dueTimeLocal: string;
  rule?: any;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type TaxEventInstance = {
  id: string;
  organizationId: string;
  templateId: string;
  periodStart: string;
  periodEnd: string;
  dueAt: string;
  status: TaxEventStatus;
  doneAt?: string | null;
  doneById?: string | null;
  note?: string | null;
  meta?: any;
  createdAt: string;
  updatedAt: string;
  template: TaxEventTemplate;
};
