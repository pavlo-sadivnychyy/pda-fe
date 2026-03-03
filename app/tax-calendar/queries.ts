export const taxKeys = {
  profile: (orgId: string) => ["tax", "profile", orgId] as const,
  templates: (orgId: string) => ["tax", "templates", orgId] as const,
  events: (orgId: string, from: string, to: string) =>
    ["tax", "events", orgId, from, to] as const,
};
