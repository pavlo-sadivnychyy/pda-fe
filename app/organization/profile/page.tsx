"use client";

import {
    useEffect,
    useState,
    ChangeEvent,
    FormEvent,
} from "react";
import {
    Alert,
    Box,
    Snackbar,
    Typography,
    Card,
    CardContent,
    CardHeader,
    Chip,
    Stack,
} from "@mui/material";

import { InfinitySpin } from "react-loader-spinner";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import { FullScreenCenteredCard } from "@/components/FullScreenCenteredCard/FullScreenCenteredCard";
import { ProfileHeader } from "@/components/ProfileHeader/ProfileHeader";
import { ProfileViewContent } from "@/components/ProfileViewContent/ProfileViewContent";
import { ProfileFormContent } from "@/components/ProfileFormContent/ProfileFormContent";
import {
    useCreateOrganization,
    useUpdateOrganization,
} from "@/hooksNew/useOrganizationProfileMutations";

// ==== Types ====

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

type OrganizationMembership = {
    organization: Organization;
};

type OrganizationsForUserResponse = {
    items: OrganizationMembership[];
};

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

// ==== Helpers ====

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

// ================= Extra Cards =================

const commonCardStyles = {
    borderRadius: 3,
    bgcolor: "#FFFFFF",
    border: "1px solid #E2E8F0",
    boxShadow:
        "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
};

// type CurrentPlanCardProps = {
//     planName: string;
// };
//
// const CurrentPlanCard = ({ planName }: CurrentPlanCardProps) => {
//     return (
//         <Card elevation={0} sx={commonCardStyles}>
//             <CardHeader
//                 title={
//                     <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
//                         Ваш поточний план
//                     </Typography>
//                 }
//                 subheader={
//                     <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
//                         Доступні можливості асистента та функціонал залежать від вашого
//                         тарифного плану.
//                     </Typography>
//                 }
//             />
//
//             <CardContent>
//                 <Stack direction="row" alignItems="center" spacing={2}>
//                     <Chip
//                         label={planName}
//                         sx={{
//                             bgcolor: "#F8FAFC",
//                             border: "1px solid #E2E8F0",
//                             color: "#111827",
//                             fontWeight: 600,
//                         }}
//                     />
//
//                     <Typography variant="body2" sx={{ color: "#334155" }}>
//                         Наразі ви використовуєте базовий тариф. Згодом ви зможете
//                         переходити на розширені плани з додатковими інструментами,
//                         більш детальною аналітикою та підтримкою командної роботи.
//                     </Typography>
//                 </Stack>
//             </CardContent>
//         </Card>
//     );
// };

const AssistantInfoCard = () => {
    return (
        <Card elevation={0} sx={commonCardStyles}>
            <CardHeader
                title={
                    <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
                        Як асистент використовує дані вашого бізнесу
                    </Typography>
                }
                subheader={
                    <Typography variant="body2" sx={{ color: "#64748B", mt: 0.5 }}>
                        Чим якісніше заповнений профіль — тим точнішими та кориснішими
                        будуть відповіді.
                    </Typography>
                }
            />

            <CardContent>
                <Stack spacing={1.2}>
                    <Typography variant="body2" sx={{ color: "#111827" }}>
                        Асистент враховує ці дані, щоб:
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#334155" }}>
                        • відповідати з урахуванням вашої ніші, послуг та аудиторії;
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#334155" }}>
                        • формувати тексти у стилі вашого бренду;
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#334155" }}>
                        • швидше створювати комерційні пропозиції, листи, описи послуг,
                        контент та документи;
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#334155" }}>
                        • пропонувати релевантні ідеї, сценарії продажів та автоматизацію
                        саме для вашого бізнесу.
                    </Typography>

                    <Typography variant="body2" sx={{ color: "#64748B", mt: 1 }}>
                        Ви можете оновлювати профіль у будь-який момент — асистент автоматично
                        враховує зміни у подальших відповідях.
                    </Typography>
                </Stack>
            </CardContent>
        </Card>
    );
};

// ================= COMPONENT =================

export default function OrganizationProfilePage() {
    const { data: userData, isLoading: isUserLoading } = useCurrentUser();
    const currentUserId = userData?.id ?? null;

    const { data, isLoading: isOrgLoading, isError } = useOrganization(
        currentUserId || undefined,
    );

    const [form, setForm] = useState<FormValues | null>(null);
    const [organization, setOrganization] = useState<Organization | null>(null);
    const [mode, setMode] = useState<ViewMode>("create");

    const [snackbar, setSnackbar] = useState({
        open: false,
        message: "",
        severity: "success" as "success" | "error",
    });

    const handleCloseSnackbar = () =>
        setSnackbar((prev) => ({ ...prev, open: false }));

    // ======== MUTATIONS ========

    const { mutate: createOrganization, isLoading: isCreating } =
        useCreateOrganization({
            onSuccess: (_d, { values }) => {
                setSnackbar({
                    open: true,
                    message: "Профіль створено",
                    severity: "success",
                });

                setOrganization({
                    id: organization?.id ?? "",
                    name: values.name,
                    industry: values.industry || null,
                    description: values.description || null,
                    websiteUrl: values.websiteUrl || null,
                    country: organization?.country ?? null,
                    city: organization?.city ?? null,
                    timeZone: organization?.timeZone ?? null,
                    defaultLanguage: organization?.defaultLanguage ?? null,
                    defaultCurrency: organization?.defaultCurrency ?? null,
                    businessNiche: values.businessNiche || null,
                    servicesDescription: values.servicesDescription || null,
                    targetAudience: values.targetAudience || null,
                    brandStyle: values.brandStyle || null,
                });

                setForm(values);
                setMode("view");
            },
            onError: (error: any) => {
                console.error(error);
                setSnackbar({
                    open: true,
                    message:
                        error?.response?.data?.message ||
                        "Не вдалося створити організацію",
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

                setOrganization((prev) =>
                    prev
                        ? {
                            ...prev,
                            ...values,
                        }
                        : prev,
                );

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

    // ===== INIT DATA =====
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

    const handleChange =
        (field: keyof FormValues) =>
            (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
                if (!form) return;
                setForm({ ...form, [field]: event.target.value });
            };

    const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if (!form || !currentUserId) return;

        if (organization) {
            updateOrganization({
                values: form,
                organizationId: organization.id,
                currentUserId,
            });
        } else {
            createOrganization({
                values: form,
                currentUserId,
            });
        }
    };

    const isSaving = isCreating || isUpdating;
    const isLoading = isUserLoading || isOrgLoading;
    const hasOrganization = !!organization;
    const profileCompletion = form ? calculateProfileCompletion(form) : 0;

    const currentPlanName =
        (userData as any)?.subscriptionPlanName ||
        (userData as any)?.plan ||
        "Безкоштовний план";

    // ================= LOADERS =================

    if (isLoading || !form) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                }}
            >
                <InfinitySpin width="200" color="#202124" />
            </Box>
        );
    }

    if (isError) {
        return (
            <Box
                sx={{
                    height: "100vh",
                    bgcolor: "#020617",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    px: 2,
                }}
            >
                <Typography color="error">
                    Не вдалося завантажити дані організації
                </Typography>
            </Box>
        );
    }

    // ================= UI =================

    return (
        <>
            <FullScreenCenteredCard>
                <ProfileHeader isEditMode={mode !== "create"} />

                {mode === "view" && hasOrganization && (
                    <>
                        <ProfileViewContent
                            organization={organization!}
                            form={form}
                            profileCompletion={profileCompletion}
                            onEdit={() => setMode("edit")}
                        />

                        {/*<Box*/}
                        {/*    sx={{*/}
                        {/*        mt: 3,*/}
                        {/*        display: "flex",*/}
                        {/*        flexDirection: "column",*/}
                        {/*        gap: 2,*/}
                        {/*    }}*/}
                        {/*>*/}
                        {/*    /!*<CurrentPlanCard planName={currentPlanName} />*!/*/}
                        {/*    <AssistantInfoCard />*/}
                        {/*</Box>*/}
                    </>
                )}

                {(mode === "edit" || mode === "create") && (
                    <ProfileFormContent
                        form={form}
                        onChange={handleChange}
                        onSubmit={handleSubmit}
                        isSaving={isSaving}
                        isEditExisting={hasOrganization}
                        profileCompletion={profileCompletion}
                    />
                )}
            </FullScreenCenteredCard>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={4000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
            >
                <Alert
                    severity={snackbar.severity}
                    onClose={handleCloseSnackbar}
                    variant="filled"
                    sx={{ width: "100%" }}
                >
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </>
    );
}
