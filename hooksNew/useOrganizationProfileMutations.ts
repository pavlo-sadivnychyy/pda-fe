"use client";

import {
  useMutation,
  useQueryClient,
  UseMutationOptions,
} from "@tanstack/react-query";
import { api } from "@/libs/axios";

export type OrganizationProfileFormValues = {
  // main profile
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  businessNiche: string;
  servicesDescription: string;
  targetAudience: string;
  brandStyle: string;

  // =========================
  // ✅ UA payment details
  // =========================
  uaCompanyName: string;
  uaCompanyAddress: string;
  uaEdrpou: string;
  uaIpn: string;
  uaIban: string;
  uaBankName: string;
  uaMfo: string;
  uaAccountNumber: string;
  uaBeneficiaryName: string;
  uaPaymentPurposeHint: string;

  // =========================
  // ✅ International payment details
  // =========================
  intlLegalName: string;
  intlBeneficiaryName: string;
  intlLegalAddress: string;
  intlVatId: string;
  intlRegistrationNumber: string;
  intlIban: string;
  intlSwiftBic: string;
  intlBankName: string;
  intlBankAddress: string;
  intlPaymentReferenceHint: string;
};

type CreateOrganizationVariables = {
  values: OrganizationProfileFormValues;
  currentUserId: string;
};

type UpdateOrganizationVariables = {
  values: OrganizationProfileFormValues;
  organizationId: string;
  currentUserId: string;
};

const toNull = (v: unknown) => {
  const trimmed = String(v ?? "").trim();
  return trimmed.length ? trimmed : null;
};

const buildPayload = (values: OrganizationProfileFormValues) => ({
  // main
  name: values.name, // name required
  industry: toNull(values.industry),
  description: toNull(values.description),
  websiteUrl: toNull(values.websiteUrl),
  businessNiche: toNull(values.businessNiche),
  servicesDescription: toNull(values.servicesDescription),
  targetAudience: toNull(values.targetAudience),
  brandStyle: toNull(values.brandStyle),

  // =========================
  // ✅ UA payment details
  // =========================
  uaCompanyName: toNull(values.uaCompanyName),
  uaCompanyAddress: toNull(values.uaCompanyAddress),
  uaEdrpou: toNull(values.uaEdrpou),
  uaIpn: toNull(values.uaIpn),
  uaIban: toNull(values.uaIban),
  uaBankName: toNull(values.uaBankName),
  uaMfo: toNull(values.uaMfo),
  uaAccountNumber: toNull(values.uaAccountNumber),
  uaBeneficiaryName: toNull(values.uaBeneficiaryName),
  uaPaymentPurposeHint: toNull(values.uaPaymentPurposeHint),

  // =========================
  // ✅ International payment details
  // =========================
  intlLegalName: toNull(values.intlLegalName),
  intlBeneficiaryName: toNull(values.intlBeneficiaryName),
  intlLegalAddress: toNull(values.intlLegalAddress),
  intlVatId: toNull(values.intlVatId),
  intlRegistrationNumber: toNull(values.intlRegistrationNumber),
  intlIban: toNull(values.intlIban),
  intlSwiftBic: toNull(values.intlSwiftBic),
  intlBankName: toNull(values.intlBankName),
  intlBankAddress: toNull(values.intlBankAddress),
  intlPaymentReferenceHint: toNull(values.intlPaymentReferenceHint),
});

export const useCreateOrganization = (
  options?: UseMutationOptions<
    any,
    unknown,
    CreateOrganizationVariables,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, CreateOrganizationVariables, unknown>({
    mutationKey: ["createOrganization"],
    mutationFn: async ({ values }) => {
      // ❗ ownerId НЕ треба: бек бере з ClerkAuthGuard
      const res = await api.post(`/organizations`, buildPayload(values));
      return res.data;
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ["organizationsForUser", variables.currentUserId],
      });

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};

export const useUpdateOrganization = (
  options?: UseMutationOptions<
    any,
    unknown,
    UpdateOrganizationVariables,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<any, unknown, UpdateOrganizationVariables, unknown>({
    mutationKey: ["updateOrganization"],
    mutationFn: async ({ values, organizationId }) => {
      const res = await api.patch(
        `/organizations/${organizationId}`,
        buildPayload(values),
      );
      return res.data;
    },
    onSuccess: async (data, variables, context) => {
      await queryClient.invalidateQueries({
        queryKey: ["organizationsForUser", variables.currentUserId],
      });

      options?.onSuccess?.(data, variables, context);
    },
    onError: (error, variables, context) => {
      options?.onError?.(error, variables, context);
    },
  });
};
