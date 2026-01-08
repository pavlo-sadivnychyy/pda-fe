export type Organization = {
  id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  country?: string | null;
  city?: string | null;
  timeZone?: string | null;
  defaultLanguage?: string | null;
  defaultCurrency?: string | null;
  businessNiche?: string | null;
  servicesDescription?: string | null;
  targetAudience?: string | null;
  brandStyle?: string | null;
};

export type OrganizationMembership = {
  organization: Organization;
};

export type OrganizationsForUserResponse = {
  items: OrganizationMembership[];
};

export type FormValues = {
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  businessNiche: string;
  servicesDescription: string;
  targetAudience: string;
  brandStyle: string;
};

export type TodoStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
export type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

export type TodoTask = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  startAt: string; // ISO
  status: TodoStatus;
  priority: TodoPriority;
};

export type TasksResponse = {
  items: TodoTask[];
};

export type AiPlanTimelineItem = {
  time: string; // "09:00"
  task: string;
  status: TodoStatus;
};

export type AiPlan = {
  date: string; // "YYYY-MM-DD"
  summary: string;
  suggestions: string[];
  timeline: AiPlanTimelineItem[];
};
