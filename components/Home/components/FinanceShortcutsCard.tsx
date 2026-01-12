"use client";

import * as React from "react";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Stack,
  Typography,
} from "@mui/material";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import DescriptionIcon from "@mui/icons-material/Description";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";

type Props = {
  onOpenClients: () => void;
  onOpenInvoices: () => void;
  onOpenQuotes: () => void; // ✅ NEW
  onOpenActs: () => void;
  onOpenAnalytics: () => void;
};

export function FinanceShortcutsCard({
  onOpenClients,
  onOpenInvoices,
  onOpenQuotes,
  onOpenActs,
  onOpenAnalytics,
}: Props) {
  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={<ReceiptLongIcon sx={{ color: "#6b7280" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Клієнти та фінанси
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Керуйте клієнтами, інвойсами та дивіться фінансову картину.
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Item
            icon={<GroupIcon sx={{ fontSize: 20, color: "#1d4ed8" }} />}
            iconBg="#eff6ff"
            title="Клієнти"
            desc="Список усіх клієнтів: контакти, компанії, реквізити — все в одному місці."
            button="Перейти до клієнтів"
            onClick={onOpenClients}
          />

          <Item
            icon={<ReceiptLongIcon sx={{ fontSize: 20, color: "#b45309" }} />}
            iconBg="#fef3c7"
            title="Інвойси"
            desc="Створюй та керуй рахунками: статуси, суми, PDF-версії для відправки та друку."
            button="Відкрити інвойси"
            onClick={onOpenInvoices}
          />

          {/* ✅ NEW: Commercial Offers / Quotes */}
          <Item
            icon={<RequestQuoteIcon sx={{ fontSize: 20, color: "#047857" }} />}
            iconBg="#ecfdf5"
            title="Комерційні пропозиції"
            desc="Формуй комерційні офери для клієнтів, відмічай статуси та конвертуй у інвойс в один клік."
            button="Відкрити пропозиції"
            onClick={onOpenQuotes}
          />

          <Item
            icon={<DescriptionIcon sx={{ fontSize: 20, color: "#0e7490" }} />}
            iconBg="#ecfeff"
            title="Акти"
            desc="Створюй акти виконаних робіт, завантажуй PDF, підписуй та передавай клієнтам або в бухгалтерію."
            button="Перейти до актів"
            onClick={onOpenActs}
          />

          <Item
            icon={<InsightsIcon sx={{ fontSize: 20, color: "#4f46e5" }} />}
            iconBg="#eef2ff"
            title="Аналітика"
            desc="Фінансовий дашборд: отримано, очікується, прострочено + візуалізація у вигляді кругової діаграми."
            button="Перейти до аналітики"
            onClick={onOpenAnalytics}
          />
        </Stack>
      </CardContent>
    </Card>
  );
}

function Item({
  icon,
  iconBg,
  title,
  desc,
  button,
  onClick,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  desc: string;
  button: string;
  onClick: () => void;
}) {
  return (
    <Box
      sx={{
        borderRadius: 2,
        border: "1px solid #e5e7eb",
        p: 1.5,
        display: "flex",
        alignItems: "flex-start",
        gap: 1.5,
        bgcolor: "#ffffff",
      }}
    >
      <Box
        sx={{
          width: 36,
          height: 36,
          borderRadius: "999px",
          bgcolor: iconBg,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexShrink: 0,
        }}
      >
        {icon}
      </Box>

      <Box sx={{ flex: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.3 }}>
          {title}
        </Typography>
        <Typography variant="body2" sx={{ color: "text.secondary", mb: 1 }}>
          {desc}
        </Typography>
        <Button
          size="small"
          variant="outlined"
          onClick={onClick}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            borderColor: "#d1d5db",
            color: "#111827",
            "&:hover": { borderColor: "#9ca3af", bgcolor: "#f9fafb" },
          }}
        >
          {button}
        </Button>
      </Box>
    </Box>
  );
}
