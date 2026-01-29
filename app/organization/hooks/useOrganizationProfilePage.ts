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

  // =========================
  // ✅ UA payment details
  // =========================
  uaCompanyName?: string | null;
  uaCompanyAddress?: string | null;
  uaEdrpou?: string | null;
  uaIpn?: string | null;
  uaIban?: string | null;
  uaBankName?: string | null;
  uaMfo?: string | null;
  uaAccountNumber?: string | null;
  uaBeneficiaryName?: string | null;
  uaPaymentPurposeHint?: string | null;

  // =========================
  // ✅ International payment details
  // =========================
  intlLegalName?: string | null;
  intlBeneficiaryName?: string | null;
  intlLegalAddress?: string | null;
  intlVatId?: string | null;
  intlRegistrationNumber?: string | null;
  intlIban?: string | null;
  intlSwiftBic?: string | null;
  intlBankName?: string | null;
  intlBankAddress?: string | null;
  intlPaymentReferenceHint?: string | null;
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

  uaCompanyName: "",
  uaCompanyAddress: "",
  uaEdrpou: "",
  uaIpn: "",
  uaIban: "",
  uaBankName: "",
  uaMfo: "",
  uaAccountNumber: "",
  uaBeneficiaryName: "",
  uaPaymentPurposeHint: "",

  intlLegalName: "",
  intlBeneficiaryName: "",
  intlLegalAddress: "",
  intlVatId: "",
  intlRegistrationNumber: "",
  intlIban: "",
  intlSwiftBic: "",
  intlBankName: "",
  intlBankAddress: "",
  intlPaymentReferenceHint: "",
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

  uaCompanyName: org.uaCompanyName ?? "",
  uaCompanyAddress: org.uaCompanyAddress ?? "",
  uaEdrpou: org.uaEdrpou ?? "",
  uaIpn: org.uaIpn ?? "",
  uaIban: org.uaIban ?? "",
  uaBankName: org.uaBankName ?? "",
  uaMfo: org.uaMfo ?? "",
  uaAccountNumber: org.uaAccountNumber ?? "",
  uaBeneficiaryName: org.uaBeneficiaryName ?? "",
  uaPaymentPurposeHint: org.uaPaymentPurposeHint ?? "",

  intlLegalName: org.intlLegalName ?? "",
  intlBeneficiaryName: org.intlBeneficiaryName ?? "",
  intlLegalAddress: org.intlLegalAddress ?? "",
  intlVatId: org.intlVatId ?? "",
  intlRegistrationNumber: org.intlRegistrationNumber ?? "",
  intlIban: org.intlIban ?? "",
  intlSwiftBic: org.intlSwiftBic ?? "",
  intlBankName: org.intlBankName ?? "",
  intlBankAddress: org.intlBankAddress ?? "",
  intlPaymentReferenceHint: org.intlPaymentReferenceHint ?? "",
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
export type PaymentReadiness = {
  ua: { ready: boolean; missing: string[] };
  international: { ready: boolean; missing: string[] };
};

const normalize = (v?: string | null) => (v ?? "").trim();

function computePaymentReadiness(form: FormValues): PaymentReadiness {
  const missingUa: string[] = [];
  const missingIntl: string[] = [];

  // UA requirements
  if (!normalize(form.uaBeneficiaryName) && !normalize(form.uaCompanyName)) {
    missingUa.push("Отримувач (uaBeneficiaryName) або Назва (uaCompanyName)");
  }
  if (!normalize(form.uaIban)) missingUa.push("IBAN (uaIban)");
  if (!normalize(form.uaBankName)) missingUa.push("Назва банку (uaBankName)");
  // optional but часто треба
  // if (!normalize(form.uaEdrpou)) missingUa.push("ЄДРПОУ (uaEdrpou)");

  // Intl requirements
  if (!normalize(form.intlBeneficiaryName) && !normalize(form.intlLegalName)) {
    missingIntl.push("Beneficiary або Legal name");
  }
  if (!normalize(form.intlIban)) missingIntl.push("IBAN (intlIban)");
  if (!normalize(form.intlSwiftBic))
    missingIntl.push("SWIFT / BIC (intlSwiftBic)");
  if (!normalize(form.intlBankName))
    missingIntl.push("Bank name (intlBankName)");

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

        const createdId = getCreatedOrgId(d);

        setOrganization((prev) => ({
          id: createdId ?? prev?.id ?? "",
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

          // UA
          uaCompanyName: values.uaCompanyName || null,
          uaCompanyAddress: values.uaCompanyAddress || null,
          uaEdrpou: values.uaEdrpou || null,
          uaIpn: values.uaIpn || null,
          uaIban: values.uaIban || null,
          uaBankName: values.uaBankName || null,
          uaMfo: values.uaMfo || null,
          uaAccountNumber: values.uaAccountNumber || null,
          uaBeneficiaryName: values.uaBeneficiaryName || null,
          uaPaymentPurposeHint: values.uaPaymentPurposeHint || null,

          // Intl
          intlLegalName: values.intlLegalName || null,
          intlBeneficiaryName: values.intlBeneficiaryName || null,
          intlLegalAddress: values.intlLegalAddress || null,
          intlVatId: values.intlVatId || null,
          intlRegistrationNumber: values.intlRegistrationNumber || null,
          intlIban: values.intlIban || null,
          intlSwiftBic: values.intlSwiftBic || null,
          intlBankName: values.intlBankName || null,
          intlBankAddress: values.intlBankAddress || null,
          intlPaymentReferenceHint: values.intlPaymentReferenceHint || null,
        }));

        setForm(values);
        setMode("view");
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
