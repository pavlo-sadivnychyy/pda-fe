import dayjs from "dayjs";
import type {
  FormValues,
  Organization,
  TodoPriority,
  TodoStatus,
} from "./types";

export const mapOrgToForm = (org: Organization): FormValues => ({
  name: org.name ?? "",
  websiteUrl: org.websiteUrl ?? "",
  industry: org.industry ?? "",
  description: org.description ?? "",
  businessNiche: org.businessNiche ?? "",
  servicesDescription: org.servicesDescription ?? "",
  targetAudience: org.targetAudience ?? "",
  brandStyle: org.brandStyle ?? "",
});

export const calculateProfileCompletion = (form: FormValues | null): number => {
  if (!form) return 0;

  const keys: (keyof FormValues)[] = [
    "name",
    "websiteUrl",
    "industry",
    "description",
    "businessNiche",
    "servicesDescription",
    "targetAudience",
    "brandStyle",
  ];

  const filled = keys.filter((k) => form[k]?.trim()).length;
  return Math.round((filled / keys.length) * 100);
};

export const formatTime = (iso: string) => dayjs(iso).format("HH:mm");

export const priorityLabel = (p: TodoPriority) => {
  switch (p) {
    case "HIGH":
      return "Високий пріоритет";
    case "LOW":
      return "Низький пріоритет";
    default:
      return "Середній пріоритет";
  }
};

export const statusLabel = (s: TodoStatus) => {
  switch (s) {
    case "DONE":
      return "Виконано";
    case "IN_PROGRESS":
      return "В процесі";
    case "CANCELLED":
      return "Скасовано";
    default:
      return "Заплановано";
  }
};
