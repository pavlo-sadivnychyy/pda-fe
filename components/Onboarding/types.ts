export type OnboardingModule =
  | "organization"
  | "documents"
  | "ai"
  | "clients"
  | "invoices"
  | "acts"
  | "quotes"
  | "analytics";

export type OnboardingTask = {
  id: OnboardingModule;
  title: string;
  description: string;
  href: string;
  target?: string; // data-onb value
};

export type OnboardingStep = {
  target: string;
  content: string;
  placement?: "auto" | "top" | "right" | "bottom" | "left";
  disableBeacon?: boolean;
};
