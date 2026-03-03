import { api } from "@/libs/axios";
import type { TaxEventInstance, TaxEventTemplate, TaxProfile } from "./types";

export const taxCalendarApi = {
  getProfile: async (organizationId: string) => {
    const { data } = await api.get<TaxProfile | null>("/tax-calendar/profile", {
      params: { organizationId },
    });
    return data;
  },

  upsertProfile: async (payload: {
    organizationId: string;
    jurisdiction: "UA";
    entityType: "FOP" | "LLC" | "OTHER";
    settings: any;
    timezone?: string;
  }) => {
    const { data } = await api.post<TaxProfile>(
      "/tax-calendar/profile",
      payload,
    );
    return data;
  },

  listTemplates: async (organizationId: string) => {
    const { data } = await api.get<TaxEventTemplate[]>(
      "/tax-calendar/templates",
      { params: { organizationId } },
    );
    return data;
  },

  createTemplate: async (payload: any) => {
    const { data } = await api.post<TaxEventTemplate>(
      "/tax-calendar/templates",
      payload,
    );
    return data;
  },

  updateTemplate: async (payload: any) => {
    const { data } = await api.patch<TaxEventTemplate>(
      "/tax-calendar/templates",
      payload,
    );
    return data;
  },

  generate: async (payload: {
    organizationId: string;
    from: string;
    to: string;
  }) => {
    const { data } = await api.post<{ created: number }>(
      "/tax-calendar/events/generate",
      payload,
    );
    return data;
  },

  listEvents: async (params: {
    organizationId: string;
    from: string;
    to: string;
  }) => {
    const { data } = await api.get<TaxEventInstance[]>("/tax-calendar/events", {
      params,
    });
    return data;
  },

  markDone: async (payload: {
    id: string;
    organizationId: string;
    note?: string;
  }) => {
    const { data } = await api.post<TaxEventInstance>(
      `/tax-calendar/events/${payload.id}/done`,
      { organizationId: payload.organizationId, note: payload.note },
    );
    return data;
  },

  markSkip: async (payload: {
    id: string;
    organizationId: string;
    note?: string;
  }) => {
    const { data } = await api.post<TaxEventInstance>(
      `/tax-calendar/events/${payload.id}/skip`,
      { organizationId: payload.organizationId, note: payload.note },
    );
    return data;
  },
};
