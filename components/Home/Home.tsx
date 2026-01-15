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

import { useRecentActivity } from "@/components/Home/hooks/useRecentActivity";
import { RecentActivityCard } from "@/components/Home/components/RecentActivityCard";

export default function HomePage() {
  const router = useRouter();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const profile = useHomeProfile(currentUserId);
  const today = useTodayTasks(currentUserId);

  const organizationId = profile.organization?.id ?? null;

  const activity = useRecentActivity(organizationId, 3);

  const openEntity = (type: "INVOICE" | "ACT" | "QUOTE", id: string) => {
    // ✅ якщо у тебе інші маршрути деталей — підправ тут
    if (type === "INVOICE") router.push(`/invoices/${id}`);
    if (type === "ACT") router.push(`/acts/${id}`);
    if (type === "QUOTE") router.push(`/quotes/${id}`);
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

            {/* ✅ NEW: Activity logs card */}
            <RecentActivityCard
              items={activity.items}
              loading={activity.isLoading || activity.isFetching}
              onOpenHistory={() => router.push("/activity")}
              onOpenEntity={openEntity}
            />

            <AiChatCard />

            <TodayTasksCard
              tasks={today.tasks}
              count={today.count}
              isLoading={today.isLoading}
              isFetching={today.isFetching}
              onOpenTodo={() => router.push("/todo")}
            />
          </Grid>

          {/* Right */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            <InvoiceDeadlinesCard
              organizationId={organizationId}
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
