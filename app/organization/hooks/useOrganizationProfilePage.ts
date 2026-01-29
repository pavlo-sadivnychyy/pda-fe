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

  // ✅ Payment details (shared for UA + International)
  legalName?: string | null;
  legalAddress?: string | null;
  vatId?: string | null;
  registrationNumber?: string | null;
  iban?: string | null;
  swiftBic?: string | null;
  bankName?: string | null;
  bankAddress?: string | null;
  beneficiaryName?: string | null;
  paymentReferenceHint?: string | null;
};

type OrganizationMembership = { organization: Organization };
type OrganizationsForUserResponse = { items: OrganizationMembership[] };

export type FormValues = {
  // main profile
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  businessNiche: string;
  servicesDescription: string;
  targetAudience: string;
  brandStyle: string;

  // payment details (shared)
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

  legalName: "",
  beneficiaryName: "",
  legalAddress: "",
  vatId: "",
  registrationNumber: "",
  iban: "",
  swiftBic: "",
  bankName: "",
  bankAddress: "",
  paymentReferenceHint: "",
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

  legalName: org.legalName ?? "",
  beneficiaryName: org.beneficiaryName ?? "",
  legalAddress: org.legalAddress ?? "",
  vatId: org.vatId ?? "",
  registrationNumber: org.registrationNumber ?? "",
  iban: org.iban ?? "",
  swiftBic: org.swiftBic ?? "",
  bankName: org.bankName ?? "",
  bankAddress: org.bankAddress ?? "",
  paymentReferenceHint: org.paymentReferenceHint ?? "",
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

// ================================
// ✅ Payment readiness validation
// ================================
type PaymentReadiness = {
  ua: { ready: boolean; missing: string[] };
  international: { ready: boolean; missing: string[] };
};

const normalize = (v?: string | null) => (v ?? "").trim();

function computePaymentReadiness(form: FormValues): PaymentReadiness {
  const missingUa: string[] = [];
  const missingIntl: string[] = [];

  const hasBeneficiary =
    Boolean(normalize(form.beneficiaryName)) ||
    Boolean(normalize(form.legalName)) ||
    Boolean(normalize(form.name));

  const hasIban = Boolean(normalize(form.iban));
  const hasBankName = Boolean(normalize(form.bankName));
  const hasSwift = Boolean(normalize(form.swiftBic));

  // UA
  if (!hasBeneficiary) missingUa.push("Отримувач (Beneficiary / Legal name)");
  if (!hasIban) missingUa.push("IBAN");
  if (!hasBankName) missingUa.push("Назва банку");

  // International
  if (!hasBeneficiary) missingIntl.push("Beneficiary / Legal name");
  if (!hasIban) missingIntl.push("IBAN");
  if (!hasSwift) missingIntl.push("SWIFT / BIC");
  if (!hasBankName) missingIntl.push("Bank name");

  return {
    ua: { ready: missingUa.length === 0, missing: missingUa },
    international: { ready: missingIntl.length === 0, missing: missingIntl },
  };
}

// ✅ максимально “терпимий” витяг id з response create
function getCreatedOrgId(d: any): string | null {
  const candidate =
    d?.id ??
    d?.organization?.id ??
    d?.data?.id ??
    d?.data?.organization?.id ??
    d?.item?.organization?.id ??
    d?.item?.id;

  return typeof candidate === "string" && candidate.trim() ? candidate : null;
}

export function useOrganizationProfilePage() {
  const { data: userData, isLoading: isUserLoading } = useCurrentUser();
  const currentUserId = userData?.id ?? null;

  const {
    data,
    isLoading: isOrgLoading,
    isError,
    refetch: refetchOrganization,
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

  // ✅ поточний orgId з state або з query data (на випадок гонок)
  const orgIdFromQuery = useMemo(() => {
    const typed = data as OrganizationsForUserResponse | undefined;
    const id = typed?.items?.[0]?.organization?.id;
    return typeof id === "string" && id.trim() ? id : null;
  }, [data]);

  const effectiveOrgId = organization?.id?.trim()
    ? organization.id
    : orgIdFromQuery;

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
      onSuccess: async (d: any, { values }: any) => {
        setSnackbar({
          open: true,
          message: "Профіль створено",
          severity: "success",
        });

        // ✅ 1) беремо реальний id зі створення (якщо бек віддає)
        const createdId = getCreatedOrgId(d);

        setOrganization((prev) => ({
          id: createdId ?? prev?.id ?? "", // ✅ вже не “затираємо” id порожнім
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

          legalName: values.legalName || null,
          beneficiaryName: values.beneficiaryName || null,
          legalAddress: values.legalAddress || null,
          vatId: values.vatId || null,
          registrationNumber: values.registrationNumber || null,
          iban: values.iban || null,
          swiftBic: values.swiftBic || null,
          bankName: values.bankName || null,
          bankAddress: values.bankAddress || null,
          paymentReferenceHint: values.paymentReferenceHint || null,
        }));

        setForm(values);
        setMode("view");

        // ✅ 2) надійний варіант: синкаємося з беком (підхопить id, якщо його не було)
        await refetchOrganization();
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
      onSuccess: (_d: any, { values }: any) => {
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

  const onSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!form || !currentUserId) return;

    // ✅ якщо org “є”, але id ще не прилетів — не валимо PATCH
    // краще 1 раз синкнутись і тоді дозволити update
    if (organization && !effectiveOrgId) {
      setSnackbar({
        open: true,
        message: "Організація ще створюється. Спробуй ще раз за секунду.",
        severity: "error",
      });
      await refetchOrganization();
      return;
    }

    if (effectiveOrgId) {
      updateOrganization({
        values: form,
        organizationId: effectiveOrgId,
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

  const paymentReadiness = useMemo(
    () => (form ? computePaymentReadiness(form) : null),
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
    if (organization) setForm(mapOrgToForm(organization));
    setMode(hasOrganization ? "view" : "create");
  };

  return {
    refetchOrganization,
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
    paymentReadiness,
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
