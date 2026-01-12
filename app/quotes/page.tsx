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

const quotesKeys = {
  all: ["quotes"] as const,
  list: (organizationId?: string) =>
    [...quotesKeys.all, "list", organizationId] as const,
};

const API = process.env.NEXT_PUBLIC_API_URL;

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
        // відкриваємо PDF інвойсу
        window.open(
          `${API}/invoices/${invoiceId}/pdf`,
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/")}
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
              label={`Всього: ${clients.length}`}
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

        {/* Твій існуючий UI */}
        <Box sx={{ maxWidth: 1200, mx: "auto" }}>
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
            message: "Комерційну пропозицію створено ✅",
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
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
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
