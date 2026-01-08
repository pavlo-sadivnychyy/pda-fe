"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import {
  useCreateOrganization,
  useUpdateOrganization,
} from "@/hooksNew/useOrganizationProfileMutations";

type Organization = {
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

type OrganizationMembership = { organization: Organization };
type OrganizationsForUserResponse = { items: OrganizationMembership[] };

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

type ViewMode = "view" | "edit" | "create";

const emptyForm: FormValues = {
  name: "",
  websiteUrl: "",
  industry: "",
  description: "",
  businessNiche: "",
  servicesDescription: "",
  targetAudience: "",
  brandStyle: "",
};

const mapOrgToForm = (org: Organization): FormValues => ({
  name: org.name ?? "",
  websiteUrl: org.websiteUrl ?? "",
  industry: org.industry ?? "",
  description: org.description ?? "",
  businessNiche: org.businessNiche ?? "",
  servicesDescription: org.servicesDescription ?? "",
  targetAudience: org.targetAudience ?? "",
  brandStyle: org.brandStyle ?? "",
});

const calculateProfileCompletion = (form: FormValues): number => {
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

export function useOrganizationProfilePage() {
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const currentUserId = userData?.id ?? null;

  const {
    data,
    isLoading: isOrgLoading,
    isError,
  } = useOrganization(currentUserId || undefined);

  const [organization, setOrganization] = useState<Organization | null>(null);
  const [form, setForm] = useState<FormValues | null>(null);
  const [mode, setMode] = useState<ViewMode>("create");

  const [snackbar, setSnackbar] = useState({
    open: false,
    message: "",
    severity: "success" as "success" | "error",
  });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // init from API once data arrives
  useEffect(() => {
    if (!data) return;

    const typed = data as OrganizationsForUserResponse;
    const org = typed.items?.[0]?.organization ?? null;

    if (org) {
      setOrganization(org);
      setForm(mapOrgToForm(org));
      setMode((prev) => (prev === "create" ? "view" : prev));
    } else {
      setOrganization(null);
      setForm(emptyForm);
      setMode("create");
    }
  }, [data]);

  const { mutate: createOrganization, isLoading: isCreating } =
    useCreateOrganization({
      onSuccess: (_d, { values }) => {
        setSnackbar({
          open: true,
          message: "Профіль створено",
          severity: "success",
        });

        // краще: після create інвалідувати org query щоб забрати справжній org з бекенду
        // але щоб UI був швидкий — оновимо локально
        setOrganization((prev) => ({
          id: prev?.id ?? "", // якщо бек повертає id в _d — краще брати з нього
          name: values.name,
          industry: values.industry || null,
          description: values.description || null,
          websiteUrl: values.websiteUrl || null,
          country: prev?.country ?? null,
          city: prev?.city ?? null,
          timeZone: prev?.timeZone ?? null,
          defaultLanguage: prev?.defaultLanguage ?? null,
          defaultCurrency: prev?.defaultCurrency ?? null,
          businessNiche: values.businessNiche || null,
          servicesDescription: values.servicesDescription || null,
          targetAudience: values.targetAudience || null,
          brandStyle: values.brandStyle || null,
        }));

        setForm(values);
        setMode("view");
      },
      onError: (error: any) => {
        console.error(error);
        setSnackbar({
          open: true,
          message:
            error?.response?.data?.message || "Не вдалося створити організацію",
          severity: "error",
        });
      },
    });

  const { mutate: updateOrganization, isLoading: isUpdating } =
    useUpdateOrganization({
      onSuccess: (_d, { values }) => {
        setSnackbar({
          open: true,
          message: "Зміни збережено",
          severity: "success",
        });

        setOrganization((prev) => (prev ? { ...prev, ...values } : prev));
        setForm(values);
        setMode("view");
      },
      onError: (error: any) => {
        console.error(error);
        setSnackbar({
          open: true,
          message:
            error?.response?.data?.message || "Не вдалося зберегти профіль",
          severity: "error",
        });
      },
    });

  const onChange =
    (field: keyof FormValues) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setForm((prev) =>
        prev ? { ...prev, [field]: event.target.value } : prev,
      );
    };

  const onSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form || !currentUserId) return;

    if (organization) {
      updateOrganization({
        values: form,
        organizationId: organization.id,
        currentUserId,
      });
    } else {
      createOrganization({ values: form, currentUserId });
    }
  };

  const profileCompletion = useMemo(
    () => (form ? calculateProfileCompletion(form) : 0),
    [form],
  );
  const isSaving = isCreating || isUpdating;
  const isLoading = isUserLoading || isOrgLoading;
  const hasOrganization = !!organization;

  const currentPlanName =
    (userData as any)?.subscriptionPlanName ||
    (userData as any)?.plan ||
    "Безкоштовний план";

  const toEdit = () => setMode("edit");
  const toView = () => setMode("view");

  const cancelEdit = () => {
    // повертаємо значення з org, якщо він є
    if (organization) setForm(mapOrgToForm(organization));
    setMode(hasOrganization ? "view" : "create");
  };

  return {
    currentUserId,
    userData,
    organization,
    form,
    mode,
    snackbar,
    profileCompletion,
    currentPlanName,
    isSaving,
    isLoading,
    isError,
    hasOrganization,
    actions: {
      onChange,
      onSubmit,
      closeSnackbar,
      toEdit,
      toView,
      cancelEdit,
    },
  };
}
