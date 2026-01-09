"use client";

import { Box, Grid } from "@mui/material";
import dayjs from "dayjs";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useHomeProfile } from "@/components/Home/hooks/useHomeProfile";
import { useTodayTasks } from "@/components/Home/hooks/useTodayTasks";
import { useAiPlan } from "./hooks/useAiPlan";
import { HomeHeader } from "@/components/Home/components/HomeHeader";
import { BusinessProfileCard } from "@/components/Home/components/BusinessProfileCard";
import { DocumentsCard } from "@/components/Home/components/DocumentsCard";
import { FinanceShortcutsCard } from "@/components/Home/components/FinanceShortcutsCard";
import { ActivityCard } from "@/components/Home/components/ActivityCard";
import { TodayTasksCard } from "./components/TodayTasksCard";
import { AiPlanCard } from "./components/AiPlanCard";
import { PopularTasksCard } from "@/components/Home/components/PopularTasksCard";
import { PlanCard } from "@/components/Home/components/PlanCard";

type PlanId = "FREE" | "BASIC" | "PRO";

export default function HomePage() {
  const router = useRouter();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const todayDateString = dayjs().format("YYYY-MM-DD");

  const profile = useHomeProfile(currentUserId);
  const today = useTodayTasks(currentUserId);
  const ai = useAiPlan(currentUserId, todayDateString);

  // ✅ беремо план з бекенду
  const currentPlanFromApi: PlanId =
    ((userData as any)?.subscription?.planId as PlanId) ?? "FREE";

  const disabledReason: "HAS_PLAN" | "NO_TASKS" | "LOADING" | "IDLE" = (() => {
    if (ai.isLoading || ai.isFetching) return "LOADING";
    if (ai.plan) return "HAS_PLAN";
    if (!today.count) return "NO_TASKS";
    return "IDLE";
  })();

  const handleGeneratePlan = () => {
    if (!currentUserId) return;
    if (disabledReason !== "IDLE") return;
    ai.generate();
  };

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

            <FinanceShortcutsCard
              onOpenClients={() => router.push("/clients")}
              onOpenInvoices={() => router.push("/invoices")}
              onOpenActs={() => router.push("/acts")}
              onOpenAnalytics={() => router.push("/analytics")}
            />

            <ActivityCard />
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <TodayTasksCard
              tasks={today.tasks}
              count={today.count}
              isLoading={today.isLoading}
              isFetching={today.isFetching}
              onOpenTodo={() => router.push("/todo")}
            />

            <AiPlanCard
              plan={ai.plan}
              disabledReason={disabledReason}
              isBusy={ai.isGenerating}
              errorText={ai.errorText}
              onGenerate={handleGeneratePlan}
            />

            <PopularTasksCard />

            {/* ✅ тут більше нема хардкоду */}
            <PlanCard currentPlan={currentPlanFromApi} />
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
