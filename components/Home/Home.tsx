"use client";

import { Box, Grid } from "@mui/material";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useHomeProfile } from "@/components/Home/hooks/useHomeProfile";
import { useTodayTasks } from "@/components/Home/hooks/useTodayTasks";
import { HomeHeader } from "@/components/Home/components/HomeHeader";
import { BusinessProfileCard } from "@/components/Home/components/BusinessProfileCard";
import { DocumentsCard } from "@/components/Home/components/DocumentsCard";
import { FinanceShortcutsCards } from "@/components/Home/components/FinanceShortcutsCards";
import { TodayTasksCard } from "./components/TodayTasksCard";
import { AiChatCard } from "@/components/Home/components/AiChatCard";
import { InvoiceDeadlinesCard } from "@/components/Home/components/InvoiceDeadlinesCard";

export default function HomePage() {
  const router = useRouter();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  // const todayDateString = dayjs().format("YYYY-MM-DD");

  const profile = useHomeProfile(currentUserId);
  const today = useTodayTasks(currentUserId);
  // const ai = useAiPlan(currentUserId, todayDateString);

  // const currentPlanFromApi: PlanId =
  //   ((userData as any)?.subscription?.planId as PlanId) ?? "FREE";

  const organizationId = profile.organization?.id ?? null;

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
      <Box sx={{ width: "100%", maxWidth: 1120 }}>
        <HomeHeader firstName={(userData as any)?.firstName} />

        <Grid container spacing={3}>
          {/* Left */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <BusinessProfileCard
              isLoading={profile.isOrgLoading}
              profileCompletion={profile.profileCompletion}
              hasNiche={profile.hasNiche}
              hasServices={profile.hasServices}
              hasAudience={profile.hasAudience}
              hasBrandStyle={profile.hasBrandStyle}
              buttonLabel={profile.buttonLabel}
              onOpenProfile={() => router.push("/organization")}
            />

            <DocumentsCard />

            <AiChatCard />

            <TodayTasksCard
              tasks={today.tasks}
              count={today.count}
              isLoading={today.isLoading}
              isFetching={today.isFetching}
              onOpenTodo={() => router.push("/todo")}
            />

            {/*<PlanCard currentPlan={currentPlanFromApi} />*/}
            {/* ✅ NEW: 5 separate cards */}
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <InvoiceDeadlinesCard
              organizationId={organizationId}
              onOpenInvoices={() => router.push("/invoices")}
              minDays={1}
              maxDays={2}
            />

            <FinanceShortcutsCards
              onOpenClients={() => router.push("/clients")}
              onOpenInvoices={() => router.push("/invoices")}
              onOpenActs={() => router.push("/acts")}
              onOpenAnalytics={() => router.push("/analytics")}
              onOpenQuotes={() => router.push("/quotes")}
            />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
