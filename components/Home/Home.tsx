"use client";

import * as React from "react";
import { Box, Grid } from "@mui/material";
import { useRouter } from "next/navigation";
import { InfinitySpin } from "react-loader-spinner";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useHomeProfile } from "@/components/Home/hooks/useHomeProfile";
import { useTodayTasks } from "@/components/Home/hooks/useTodayTasks";
import { HomeHeader } from "@/components/Home/components/HomeHeader";
import { DocumentsCard } from "@/components/Home/components/DocumentsCard";
import { TodayTasksCard } from "./components/TodayTasksCard";
import { AiChatCard } from "@/components/Home/components/AiChatCard";

import { useRecentActivity } from "@/components/Home/hooks/useRecentActivity";
import { RecentActivityCard } from "@/components/Home/components/RecentActivityCard";
import { PlanId } from "@/components/Home/components/PlanCard";
import {
  ActsShortcutCard,
  AnalyticsShortcutCard,
  ClientsShortcutCard,
  QuotesShortcutCard,
  ServicesShortcutCard,
} from "./components/FinanceShortcutsCards";
import { InvoicesShortcutCard } from "@/components/Home/components/FinanceShortcutsCards";

import { completeOnboarding } from "@/components/Onboarding/api";
import { OrgGateModal } from "@/components/Onboarding/OrgGateModal";
import { InvoiceDeadlinesCard } from "@/components/Home/components/InvoiceDeadlinesCard";

export default function HomePage() {
  const router = useRouter();

  const { data: userData, isLoading } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const profile = useHomeProfile(currentUserId);
  const today = useTodayTasks(currentUserId);

  const organizationId = profile.organization?.id ?? null;
  const activity = useRecentActivity(organizationId, 3);

  const currentPlanFromApi: PlanId =
    ((userData as any)?.subscription?.planId as PlanId) ?? "FREE";

  const openEntity = (type: "INVOICE" | "ACT" | "QUOTE", id: string) => {
    if (type === "INVOICE") router.push(`/invoices/${id}`);
    if (type === "ACT") router.push(`/acts/${id}`);
    if (type === "QUOTE") router.push(`/quotes/${id}`);
  };

  const [dismissed, setDismissed] = React.useState(false);

  const onboardingValueRaw =
    (userData as any)?.onboardingCompleted ??
    (userData as any)?.onBoardingCompleted;

  const onboardingKnown = typeof onboardingValueRaw === "boolean";
  const onboardingCompleted = onboardingKnown ? onboardingValueRaw : false;

  React.useEffect(() => {
    if (onboardingKnown && onboardingCompleted) setDismissed(false);
  }, [onboardingKnown, onboardingCompleted]);

  if (isLoading || profile.isOrgLoading || !onboardingKnown) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f3f4f6",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InfinitySpin width="200" color="#202124" />
      </Box>
    );
  }

  const shouldOpenOrgGate = !onboardingCompleted && !dismissed;

  if (shouldOpenOrgGate) {
    const safeComplete = async () => {
      try {
        await completeOnboarding();
      } catch (e) {
        console.error("completeOnboarding failed:", e);
      }
    };

    return (
      <OrgGateModal
        open
        allowClose
        onLater={async () => {
          await safeComplete();
          setDismissed(true);
        }}
        onCreateOrg={async () => {
          await safeComplete();
          router.push("/organization");
        }}
      />
    );
  }

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 3,
        px: 2,
      }}
    >
      <Box sx={{ width: "100%", maxWidth: "90%" }}>
        <HomeHeader
          firstName={(userData as any)?.firstName}
          planId={currentPlanFromApi}
          organizationName={profile.organization?.name ?? null}
          hasOrganization={!!profile.organization?.id}
        />

        <Grid container spacing={3}>
          {/* LEFT */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <TodayTasksCard
              tasks={today.tasks}
              count={today.count}
              isLoading={today.isLoading}
              isFetching={today.isFetching}
              onOpenTodo={() => router.push("/todo")}
            />

            <InvoiceDeadlinesCard
              notAvailiable={
                currentPlanFromApi === "FREE" || currentPlanFromApi === "BASIC"
              }
              organizationId={organizationId}
              minDays={1}
              maxDays={2}
            />

            <RecentActivityCard
              items={activity.items}
              loading={activity.isLoading || activity.isFetching}
              onOpenHistory={() => router.push("/activity")}
              onOpenEntity={openEntity}
            />

            <AnalyticsShortcutCard
              onClick={() => router.push("/analytics")}
              notAvailiable={
                currentPlanFromApi === "FREE" || currentPlanFromApi === "BASIC"
              }
            />
            <AiChatCard />
          </Grid>

          {/* RIGHT */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <ClientsShortcutCard onClick={() => router.push("/clients")} />
            <ServicesShortcutCard onClick={() => router.push("/services")} />
            <InvoicesShortcutCard onClick={() => router.push("/invoices")} />
            <QuotesShortcutCard
              onClick={() => router.push("/quotes")}
              notAvailiable={currentPlanFromApi === "FREE"}
            />
            <ActsShortcutCard
              onClick={() => router.push("/acts")}
              notAvailiable={currentPlanFromApi === "FREE"}
            />
            <DocumentsCard />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
