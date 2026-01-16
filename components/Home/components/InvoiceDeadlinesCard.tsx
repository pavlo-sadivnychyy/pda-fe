"use client";

import * as React from "react";
import dayjs from "dayjs";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  Divider,
  IconButton,
  Stack,
  Typography,
  Snackbar,
  Alert,
} from "@mui/material";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import EmailIcon from "@mui/icons-material/Email";
import RefreshIcon from "@mui/icons-material/Refresh";
import { InfinitySpin } from "react-loader-spinner";

import { useDueSoonInvoices } from "@/components/Home/hooks/useDueSoonInvoices";
import { useSendInvoiceDeadlineReminder } from "@/components/Home/hooks/useSendInvoiceDeadlineReminder";

function money(v: any): string {
  if (v == null) return "0.00";
  if (typeof v === "number") return v.toFixed(2);
  if (typeof v === "string") {
    const n = Number(v);
    return Number.isFinite(n) ? n.toFixed(2) : v;
  }
  if (v && typeof v.toNumber === "function") {
    try {
      return Number(v.toNumber()).toFixed(2);
    } catch {
      return String(v);
    }
  }
  return String(v);
}

function formatDueLabel(dueIso: string | null) {
  if (!dueIso) return "—";
  const due = dayjs(dueIso);
  const today = dayjs().startOf("day");
  const diff = due.startOf("day").diff(today, "day");

  if (diff === 0) return "Сьогодні";
  if (diff === 1) return "Завтра";
  if (diff > 1) return `Через ${diff} дні`;
  if (diff === -1) return "Вчора";
  return `Прострочено (${Math.abs(diff)} дні)`;
}

export function InvoiceDeadlinesCard({
  organizationId,
  minDays = 1,
  maxDays = 2,
  dragHandle,
}: {
  organizationId: string | null;
  minDays?: number;
  maxDays?: number;
  dragHandle?: React.ReactNode;
}) {
  const dueSoon = useDueSoonInvoices({
    organizationId,
    minDays,
    maxDays,
    includeDraft: false,
    includeOverdue: false,
  });

  const remind = useSendInvoiceDeadlineReminder();

  const [snack, setSnack] = React.useState<{
    open: boolean;
    kind: "success" | "error" | "warning";
    text: string;
  }>({ open: false, kind: "success", text: "" });

  const closeSnack = () => setSnack((s) => ({ ...s, open: false }));

  const handleSend = async (invoiceId: string) => {
    try {
      await remind.mutateAsync({
        invoiceId,
        invalidateOrgId: organizationId,
        force: false,
      });

      setSnack({
        open: true,
        kind: "success",
        text: "Нагадування надіслано на email клієнта.",
      });
    } catch (e: any) {
      const already =
        e?.response?.data?.message ===
        "Reminder was already sent recently. Try later or use force.";

      const msg = already
        ? "Ви вже надіслали нагадування цьому клієнту"
        : e?.response?.data?.message ||
          e?.message ||
          "Не вдалося надіслати нагадування.";

      setSnack({
        open: true,
        kind: already ? "warning" : "error",
        text: String(msg),
      });
    }
  };

  const items = dueSoon.invoices;

  return (
    <>
      <Card elevation={3} sx={{ borderRadius: 3 }}>
        <CardHeader
          avatar={
            <Box
              sx={{
                width: 40,
                height: 40,
                borderRadius: 999,
                bgcolor: "#fef3c7",
                display: "grid",
                placeItems: "center",
              }}
            >
              <AccessTimeIcon sx={{ color: "#b45309" }} />
            </Box>
          }
          title={
            <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
              Дедлайни оплати ваших інвойсів
            </Typography>
          }
          subheader={
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Інвойси, у яких до дедлайну залишилось {minDays}–{maxDays} дні.
            </Typography>
          }
          action={
            <Stack direction="row" alignItems="center" spacing={0.5}>
              <IconButton
                onClick={() => dueSoon.refetch()}
                disabled={dueSoon.isFetching}
                sx={{ "&:hover": { bgcolor: "#f3f4f6" } }}
              >
                <RefreshIcon fontSize="small" />
              </IconButton>

              <Box sx={{ ml: 0.25, mr: 0.5 }}>{dragHandle}</Box>
            </Stack>
          }
        />

        <CardContent sx={{ pt: 0 }}>
          {dueSoon.isLoading ? (
            <Box
              sx={{
                py: 4,
                display: "grid",
                placeItems: "center",
              }}
            >
              <InfinitySpin width="160" color="#202124" />
              <Typography
                variant="body2"
                sx={{ mt: 1.5, color: "text.secondary" }}
              >
                Завантажую інвойси з дедлайнами…
              </Typography>
            </Box>
          ) : (
            <Stack spacing={1.2}>
              {items.length === 0 ? (
                <Box
                  sx={{
                    p: 1.2,
                    borderRadius: 2,
                    border: "1px dashed #e5e7eb",
                    bgcolor: "#ffffff",
                  }}
                >
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    На найближчі {minDays}–{maxDays} дні немає інвойсів з
                    дедлайном.
                  </Typography>
                </Box>
              ) : (
                <>
                  {items.map((inv, idx) => {
                    const clientName =
                      inv.client?.contactName?.trim() ||
                      inv.client?.name?.trim() ||
                      "Клієнт не вказаний";

                    const email = inv.client?.email?.trim() || "";
                    const hasEmail = Boolean(email);

                    const lastSentAt = inv.reminders?.[0]?.sentAt
                      ? dayjs(inv.reminders[0].sentAt).format(
                          "YYYY-MM-DD HH:mm",
                        )
                      : null;

                    return (
                      <React.Fragment key={inv.id}>
                        <Box
                          sx={{
                            display: "flex",
                            alignItems: "flex-start",
                            justifyContent: "space-between",
                            gap: 1.2,
                          }}
                        >
                          <Box sx={{ minWidth: 0 }}>
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <Typography
                                variant="body2"
                                sx={{
                                  fontWeight: 700,
                                  color: "#111827",
                                  whiteSpace: "nowrap",
                                }}
                              >
                                {inv.number}
                              </Typography>

                              <Chip
                                size="small"
                                icon={
                                  <NotificationsActiveIcon
                                    sx={{ fontSize: 16 }}
                                  />
                                }
                                label={formatDueLabel(inv.dueDate)}
                                sx={{
                                  borderRadius: 999,
                                  fontWeight: 700,
                                  bgcolor: "#fff7ed",
                                  color: "#9a3412",
                                  "& .MuiChip-icon": { color: "#9a3412" },
                                }}
                              />
                            </Stack>

                            <Typography
                              variant="body2"
                              sx={{
                                color: "text.secondary",
                                lineHeight: 1.5,
                                mt: 0.4,
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={clientName}
                            >
                              {clientName}
                              {inv.dueDate ? (
                                <>
                                  {" "}
                                  • дедлайн{" "}
                                  {dayjs(inv.dueDate).format("YYYY-MM-DD")}
                                </>
                              ) : null}{" "}
                              • {money(inv.total)} {inv.currency || "UAH"}
                            </Typography>

                            {lastSentAt ? (
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                Останнє нагадування: {lastSentAt}
                              </Typography>
                            ) : (
                              <Typography
                                variant="caption"
                                sx={{ color: "text.secondary" }}
                              >
                                Нагадування ще не надсилалось
                              </Typography>
                            )}
                          </Box>

                          <Button
                            onClick={() => handleSend(inv.id)}
                            disabled={!hasEmail || remind.isPending}
                            startIcon={<EmailIcon />}
                            sx={{
                              textTransform: "none",
                              fontWeight: 700,
                              borderRadius: 999,
                              px: 1.4,
                              color: "#111827",
                              bgcolor: "#f3f4f6",
                              "&:hover": { bgcolor: "#e5e7eb" },
                              "&.Mui-disabled": {
                                bgcolor: "#f3f4f6",
                                color: "rgba(17,24,39,0.35)",
                              },
                              whiteSpace: "nowrap",
                              flexShrink: 0,
                            }}
                          >
                            Нагадати
                          </Button>
                        </Box>

                        {!hasEmail ? (
                          <Typography
                            variant="caption"
                            sx={{ color: "text.secondary", ml: 0.2 }}
                          >
                            Email клієнта не заповнений — нагадування надіслати
                            не можна.
                          </Typography>
                        ) : null}

                        {idx !== items.length - 1 ? (
                          <Divider sx={{ my: 1 }} />
                        ) : null}
                      </React.Fragment>
                    );
                  })}
                </>
              )}
            </Stack>
          )}
        </CardContent>
      </Card>

      <Snackbar
        open={snack.open}
        autoHideDuration={4000}
        onClose={closeSnack}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          onClose={closeSnack}
          severity={snack.kind}
          sx={{ width: "100%" }}
        >
          {snack.text}
        </Alert>
      </Snackbar>
    </>
  );
}
