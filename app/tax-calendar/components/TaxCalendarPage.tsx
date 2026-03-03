"use client";

import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import RefreshIcon from "@mui/icons-material/Refresh";
import SettingsOutlinedIcon from "@mui/icons-material/SettingsOutlined";
import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import {
  Alert,
  Button,
  Chip,
  Divider,
  Stack,
  Typography,
  Grid,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useOrganizationContext } from "@/app/invoices/hooks/useOrganizationContext";
import { taxCalendarApi } from "@/app/tax-calendar/taxCalendar.api";
import { taxKeys } from "@/app/tax-calendar/queries";

import { SectionCard } from "@/app/tax-calendar/components/SectionCard";
import { LockedFeatureCallout } from "@/app/tax-calendar/components/LockedFeatureCallout";
import { TaxSettingsDialog } from "@/app/tax-calendar/components/TaxSettingsDialog";
import { TaxEventsCard } from "@/app/tax-calendar/components/TaxEventsCard";

function startOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(0, 0, 0, 0);
  return x;
}

function endOfDay(d: Date) {
  const x = new Date(d);
  x.setHours(23, 59, 59, 999);
  return x;
}

export function TaxCalendarPage() {
  const qc = useQueryClient();
  const { organizationId, planId, isOrgLoading, isUserLoading, orgData } =
    useOrganizationContext();

  const [settingsOpen, setSettingsOpen] = useState(false);

  const [range, setRange] = useState(() => {
    const from = new Date();
    from.setDate(from.getDate() - 7);
    const to = new Date();
    to.setDate(to.getDate() + 60);
    return { from, to };
  });

  // ✅ важливо: нормалізуємо межі дня, щоб ISO не зсував дату
  const fromIso = useMemo(
    () => startOfDay(range.from).toISOString(),
    [range.from],
  );
  const toIsoStr = useMemo(() => endOfDay(range.to).toISOString(), [range.to]);

  const locked = planId === "FREE";

  const profileQ = useQuery({
    queryKey: organizationId
      ? taxKeys.profile(organizationId)
      : ["tax", "profile", "noorg"],
    enabled: Boolean(organizationId) && !locked,
    queryFn: () => taxCalendarApi.getProfile(organizationId!),
    retry: false,
  });

  const templatesQ = useQuery({
    queryKey: organizationId
      ? taxKeys.templates(organizationId)
      : ["tax", "templates", "noorg"],
    enabled: Boolean(organizationId) && !locked,
    queryFn: () => taxCalendarApi.listTemplates(organizationId!),
    retry: false,
  });

  const eventsQ = useQuery({
    queryKey: organizationId
      ? taxKeys.events(organizationId, fromIso, toIsoStr)
      : ["tax", "events", "noorg"],
    enabled: Boolean(organizationId) && !locked,
    queryFn: () =>
      taxCalendarApi.listEvents({
        organizationId: organizationId!,
        from: fromIso,
        to: toIsoStr,
      }),
    retry: false,
  });

  const generateM = useMutation({
    mutationFn: () =>
      taxCalendarApi.generate({
        organizationId: organizationId!,
        from: fromIso,
        to: toIsoStr,
      }),
    onSuccess: async () => {
      if (!organizationId) return;
      await qc.invalidateQueries({
        queryKey: taxKeys.events(organizationId, fromIso, toIsoStr),
      });
    },
  });

  const refreshAll = async () => {
    await qc.invalidateQueries({ queryKey: ["tax"] });
  };

  if (isUserLoading || isOrgLoading) {
    return (
      <SectionCard title="Податковий календар" subtitle="Завантаження...">
        <Alert severity="info">Завантажую дані…</Alert>
      </SectionCard>
    );
  }

  if (!organizationId) {
    return (
      <Alert severity="warning">
        Немає активної організації. Спочатку вибери/створи організацію.
      </Alert>
    );
  }

  if (locked) {
    return (
      <SectionCard
        title="Податковий календар"
        subtitle="Дедлайни та контроль звітності по організації"
        right={
          <Chip
            icon={<CalendarMonthIcon />}
            label="Податковий календар"
            sx={{ borderRadius: "999px" }}
          />
        }
      >
        <LockedFeatureCallout
          text="Функція доступна на планах BASIC та PRO."
          onUpgrade={() => (window.location.href = "/billing")}
        />
      </SectionCard>
    );
  }

  const profile = profileQ.data ?? null;
  const templates = templatesQ.data ?? [];
  const events = eventsQ.data ?? [];

  const hasProfile = Boolean(profile?.id);
  const hasTemplates = templates.length > 0;
  const showSetupHint = !hasProfile || !hasTemplates;

  return (
    <Stack gap={2}>
      <SectionCard
        title="Податковий календар"
        subtitle="Конкретні дедлайни на вибраний період"
        right={
          <Stack direction="row" gap={1}>
            <Button
              startIcon={<RefreshIcon />}
              variant="outlined"
              onClick={refreshAll}
              disabled={
                profileQ.isFetching ||
                templatesQ.isFetching ||
                eventsQ.isFetching ||
                generateM.isPending
              }
              sx={{
                borderRadius: "999px",
                borderColor: "black",
                color: "black",
              }}
            >
              Оновити
            </Button>

            <Button
              startIcon={<SettingsOutlinedIcon />}
              variant="contained"
              onClick={() => setSettingsOpen(true)}
              sx={{
                textTransform: "none",
                borderRadius: 999,
                py: 1,
                bgcolor: "#111827",
                boxShadow: "none",
                color: "white",
                "&:hover": {
                  bgcolor: "#000000",
                  boxShadow: "none",
                },
              }}
            >
              Профіль і шаблони
            </Button>
          </Stack>
        }
      >
        {profileQ.error || templatesQ.error || eventsQ.error ? (
          <Alert severity="error" sx={{ mb: 2 }}>
            {String(
              (profileQ.error as any)?.message ??
                (templatesQ.error as any)?.message ??
                (eventsQ.error as any)?.message ??
                "Помилка",
            )}
          </Alert>
        ) : null}

        {showSetupHint ? (
          <Alert
            icon={<InfoOutlinedIcon />}
            severity="info"
            sx={{
              mt: 2,
              borderRadius: "12px",
              border: "1px solid rgba(15, 23, 42, 0.08)",
              bgcolor: "background.paper",
            }}
            action={
              <Button
                onClick={() => setSettingsOpen(true)}
                variant="contained"
                size="small"
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  py: 1,
                  bgcolor: "#111827",
                  boxShadow: "none",
                  color: "white",
                  "&:hover": {
                    bgcolor: "#000000",
                    boxShadow: "none",
                  },
                }}
              >
                Відкрити налаштування
              </Button>
            }
          >
            <Typography fontWeight={800} sx={{ mb: 0.5 }}>
              Щоб календар працював
            </Typography>

            <Typography fontSize={13} color="text.secondary">
              {!hasProfile ? (
                <>
                  1) Створи <b>податковий профіль</b> (ФОП/ТОВ, система
                  оподаткування).
                </>
              ) : (
                <>✅ Профіль налаштований.</>
              )}
              <br />
              {!hasTemplates ? (
                <>
                  2) Додай <b>шаблони</b> — правила, за якими система створює
                  події (наприклад: “щокварталу +25 днів о 18:00”).
                </>
              ) : (
                <>✅ Шаблони додані.</>
              )}
            </Typography>
          </Alert>
        ) : null}

        <Divider sx={{ my: 2 }} />

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, sm: 12, md: 12 }}>
            <TaxEventsCard
              organizationId={organizationId}
              events={events}
              eventsLoading={eventsQ.isFetching}
              range={range}
              setRange={setRange}
              canGenerate={hasProfile && hasTemplates}
              onGenerate={() => generateM.mutate()}
              generating={generateM.isPending}
              onOpenSettings={() => setSettingsOpen(true)}
            />
          </Grid>
        </Grid>
      </SectionCard>

      <TaxSettingsDialog
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        organizationId={organizationId}
        initialProfile={profile}
        templates={templates}
      />
    </Stack>
  );
}
