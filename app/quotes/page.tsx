"use client";

import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Snackbar,
  Stack,
  Typography,
} from "@mui/material";
import { useMemo, useState } from "react";
import { useQueryClient, useQuery } from "@tanstack/react-query";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";
import { api } from "@/libs/axios";

import { useClientsQueries } from "@/app/clients/hooks/useClientsQueries";
import type { Quote, QuoteAction } from "./types";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";
import { QuotesGrid } from "@/app/quotes/components/QuotesGrid";
import { CreateQuoteDrawer } from "@/app/quotes/components/CreateQuoteDrawer";
import { QuotesCard } from "@/app/quotes/components/QuotesCard";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import * as React from "react";

import ErrorOutlineIcon from "@mui/icons-material/ErrorOutline";
import TimelineIcon from "@mui/icons-material/Timeline";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import BoltIcon from "@mui/icons-material/Bolt";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";

const quotesKeys = {
  all: ["quotes"] as const,
  list: (organizationId?: string) =>
    [...quotesKeys.all, "list", organizationId] as const,
};

type QuotesListResponse = { quotes: Quote[] };

function useQuotesQuery(organizationId?: string) {
  return useQuery<Quote[]>({
    queryKey: quotesKeys.list(organizationId),
    enabled: !!organizationId,
    queryFn: async () => {
      const res = await api.get<QuotesListResponse>("/quotes", {
        params: { organizationId },
      });
      return res.data.quotes ?? [];
    },
  });
}

async function postQuoteAction(id: string, action: QuoteAction) {
  await api.post(`/quotes/${id}/${action}`);
}

async function convertQuoteToInvoice(id: string) {
  const res = await api.post(`/quotes/${id}/convert-to-invoice`);
  return res.data; // { invoice }
}

export default function QuotesPage() {
  const queryClient = useQueryClient();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);

  const organizationId = useMemo(() => {
    const org = (orgData as any)?.items?.[0]?.organization;
    return org?.id ?? null;
  }, [orgData]);

  const { clientsQuery } = useClientsQueries(organizationId || undefined);
  const clients = clientsQuery.data ?? [];

  const quotesQuery = useQuotesQuery(organizationId || undefined);
  const quotes = quotesQuery.data ?? [];
  const router = useRouter();
  const [busyId, setBusyId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });

  const closeSnackbar = () => setSnackbar((p) => ({ ...p, open: false }));

  const refreshQuotes = async () => {
    await queryClient.invalidateQueries({
      queryKey: quotesKeys.list(organizationId || undefined),
    });
  };

  const onAction = async (id: string, action: QuoteAction) => {
    try {
      setBusyId(id);
      await postQuoteAction(id, action);
      await refreshQuotes();
      setSnackbar({ open: true, message: "Готово ✅", severity: "success" });
    } catch (e: any) {
      console.error(e);
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || "Помилка",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const onConvert = async (id: string) => {
    try {
      setBusyId(id);
      const data = await convertQuoteToInvoice(id);
      await refreshQuotes();

      const invoiceId = data?.invoice?.id;
      if (invoiceId) {
        window.open(
          `/api/pdf/invoices/${invoiceId}`,
          "_blank",
          "noopener,noreferrer",
        );
      }

      setSnackbar({
        open: true,
        message: "Quote конвертовано в Invoice ✅",
        severity: "success",
      });
    } catch (e: any) {
      console.error(e);
      setSnackbar({
        open: true,
        message: e?.response?.data?.message || "Не вдалося конвертувати",
        severity: "error",
      });
    } finally {
      setBusyId(null);
    }
  };

  const quotesCount = quotes.length;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="xl" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            Повернутись назад
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <RequestQuoteIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Комерційні пропозиції
              </Typography>
            </Stack>

            <Chip
              label={`Всього: ${quotesCount}`}
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
            Створюй пропозиції клієнтам і конвертуй в інвойс в один клік.
          </Typography>
        </Box>

        {/* ✅ Friendly hint block (додано) */}
        <Box sx={{ mt: 2, mb: 3 }}>
          <Alert
            icon={<ErrorOutlineIcon sx={{ fontSize: 20 }} />}
            severity="info"
            sx={{
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              borderRadius: 3,
              "& .MuiAlert-message": { width: "100%" },
            }}
          >
            <Typography
              variant="body2"
              sx={{ color: "#334155", lineHeight: 1.55 }}
            >
              Тут зручно тримати весь процес під контролем:{" "}
              <strong>змінюй статуси</strong> (в роботі / на погодженні /
              прийнято / відхилено), щоб у будь-який момент бачити,{" "}
              <strong>на якому етапі кожна угода</strong>. А коли клієнт погодив
              пропозицію — можна <strong>перетворити її в інвойс</strong> одним
              кліком, без дублювання даних і ручного копіювання.
            </Typography>

            <Stack
              direction={{ xs: "column", sm: "row" }}
              spacing={1}
              sx={{ mt: 1.25 }}
            >
              <Chip
                size="small"
                icon={<TimelineIcon />}
                label="Статуси = прозорий процес"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<AutorenewIcon />}
                label="Без дублювання даних"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<ReceiptLongIcon />}
                label="Конвертація в інвойс"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
              <Chip
                size="small"
                icon={<BoltIcon />}
                label="1 клік → готовий документ"
                sx={{
                  bgcolor: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  fontWeight: 600,
                }}
              />
            </Stack>
          </Alert>
        </Box>

        {/* Твій існуючий UI */}
        <Box sx={{ maxWidth: 1700, mx: "auto" }}>
          <QuotesCard
            count={clients.length}
            organizationId={organizationId}
            currentUserId={currentUserId}
            setCreateOpen={setCreateOpen}
          >
            <QuotesGrid
              quotes={quotes as any}
              clients={clients as any}
              loading={quotesQuery.isLoading || clientsQuery.isLoading}
              onAction={onAction}
              onConvert={onConvert}
              actionBusyId={busyId}
            />
          </QuotesCard>
        </Box>
      </Container>

      <CreateQuoteDrawer
        open={createOpen}
        onClose={() => setCreateOpen(false)}
        organizationId={organizationId || ""}
        createdById={currentUserId || ""}
        clients={clients as any}
        onCreated={async () => {
          setCreateOpen(false);
          await refreshQuotes();
          setSnackbar({
            open: true,
            message: "Комерційну пропозицію створено",
            severity: "success",
          });
        }}
        onError={(msg) =>
          setSnackbar({ open: true, message: msg, severity: "error" })
        }
      />

      <Snackbar
        open={snackbar.open}
        autoHideDuration={3000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={closeSnackbar}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
}
