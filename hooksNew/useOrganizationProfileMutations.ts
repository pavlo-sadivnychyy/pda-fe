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

  // payment details
  legalName: string;
  beneficiaryName: string;
  legalAddress: string;
  vatId: string;
  registrationNumber: string;
  iban: string;
  swiftBic: string;
  bankName: string;
  bankAddress: string;
  paymentReferenceHint: string;
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

const toNull = (v: string) => {
  const trimmed = (v ?? "").trim();
  return trimmed.length ? trimmed : null;
};

export const useCreateOrganization = (
  options?: UseMutationOptions<
    void,
    unknown,
    CreateOrganizationVariables,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, CreateOrganizationVariables, unknown>({
    mutationKey: ["createOrganization"],
    mutationFn: async ({ values, currentUserId }) => {
      await api.post(`/organizations`, {
        ownerId: currentUserId,

        // main
        name: values.name,
        industry: toNull(values.industry),
        description: toNull(values.description),
        websiteUrl: toNull(values.websiteUrl),
        businessNiche: toNull(values.businessNiche),
        servicesDescription: toNull(values.servicesDescription),
        targetAudience: toNull(values.targetAudience),
        brandStyle: toNull(values.brandStyle),

        // payment
        legalName: toNull(values.legalName),
        beneficiaryName: toNull(values.beneficiaryName),
        legalAddress: toNull(values.legalAddress),
        vatId: toNull(values.vatId),
        registrationNumber: toNull(values.registrationNumber),
        iban: toNull(values.iban),
        swiftBic: toNull(values.swiftBic),
        bankName: toNull(values.bankName),
        bankAddress: toNull(values.bankAddress),
        paymentReferenceHint: toNull(values.paymentReferenceHint),
      });
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
    void,
    unknown,
    UpdateOrganizationVariables,
    unknown
  >,
) => {
  const queryClient = useQueryClient();

  return useMutation<void, unknown, UpdateOrganizationVariables, unknown>({
    mutationKey: ["updateOrganization"],
    mutationFn: async ({ values, organizationId }) => {
      await api.patch(`/organizations/${organizationId}`, {
        // main
        name: values.name,
        industry: toNull(values.industry),
        description: toNull(values.description),
        websiteUrl: toNull(values.websiteUrl),
        businessNiche: toNull(values.businessNiche),
        servicesDescription: toNull(values.servicesDescription),
        targetAudience: toNull(values.targetAudience),
        brandStyle: toNull(values.brandStyle),

        // payment
        legalName: toNull(values.legalName),
        beneficiaryName: toNull(values.beneficiaryName),
        legalAddress: toNull(values.legalAddress),
        vatId: toNull(values.vatId),
        registrationNumber: toNull(values.registrationNumber),
        iban: toNull(values.iban),
        swiftBic: toNull(values.swiftBic),
        bankName: toNull(values.bankName),
        bankAddress: toNull(values.bankAddress),
        paymentReferenceHint: toNull(values.paymentReferenceHint),
      });
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
