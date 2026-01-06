"use client";

import axios from "axios";
import {
    useMutation,
    useQueryClient,
    UseMutationOptions,
} from "@tanstack/react-query";

export type OrganizationProfileFormValues = {
    name: string;
    websiteUrl: string;
    industry: string;
    description: string;
    businessNiche: string;
    servicesDescription: string;
    targetAudience: string;
    brandStyle: string;
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

const api = axios.create({
    baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001",
    withCredentials: true,
});

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
                name: values.name,
                industry: values.industry || null,
                description: values.description || null,
                websiteUrl: values.websiteUrl || null,
                businessNiche: values.businessNiche || null,
                servicesDescription: values.servicesDescription || null,
                targetAudience: values.targetAudience || null,
                brandStyle: values.brandStyle || null,
            });
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: ["organizationsForUser", variables.currentUserId],
            });

            if (options?.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (options?.onError) {
                options.onError(error, variables, context);
            }
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
                name: values.name,
                industry: values.industry || null,
                description: values.description || null,
                websiteUrl: values.websiteUrl || null,
                businessNiche: values.businessNiche || null,
                servicesDescription: values.servicesDescription || null,
                targetAudience: values.targetAudience || null,
                brandStyle: values.brandStyle || null,
            });
        },
        onSuccess: async (data, variables, context) => {
            await queryClient.invalidateQueries({
                queryKey: ["organizationsForUser", variables.currentUserId],
            });

            if (options?.onSuccess) {
                options.onSuccess(data, variables, context);
            }
        },
        onError: (error, variables, context) => {
            if (options?.onError) {
                options.onError(error, variables, context);
            }
        },
    });
};
