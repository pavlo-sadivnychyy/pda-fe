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
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";

import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import RequestQuoteIcon from "@mui/icons-material/RequestQuote";
import DescriptionIcon from "@mui/icons-material/Description";
import InsightsIcon from "@mui/icons-material/Insights";

type ShortcutProps = {
  onClick: () => void;
  dragHandle?: React.ReactNode;
};

function ShortcutCard({
  icon,
  iconBg,
  title,
  subtitle,
  desc,
  onClick,
  dataOnb,
  dragHandle,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle?: string;
  desc: React.ReactNode[];
  onClick: () => void;
  dataOnb?: string;
  dragHandle?: React.ReactNode;
}) {
  return (
    <Card data-onb={dataOnb} elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: 999,
              bgcolor: iconBg,
              display: "grid",
              placeItems: "center",
            }}
          >
            {icon}
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            {title}
          </Typography>
        }
        subheader={
          subtitle ? (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          ) : null
        }
        action={
          <Stack direction="row" alignItems="center" spacing={0.5}>
            <Button
              onClick={onClick}
              endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
              sx={{
                textTransform: "none",
                fontWeight: 600,
                color: "#111827",
                borderRadius: 999,
                px: 1.5,
                "&:hover": { bgcolor: "#f3f4f6" },
                whiteSpace: "nowrap",
              }}
            >
              Перейти
            </Button>

            {/* ✅ drag handle */}
            <Box sx={{ mr: 0.5 }}>{dragHandle}</Box>
          </Stack>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Stack spacing={1.1}>
          {desc.map((p, idx) => (
            <Typography
              key={idx}
              variant="body2"
              sx={{ color: "text.secondary", lineHeight: 1.5 }}
            >
              {p}
            </Typography>
          ))}
        </Stack>
      </CardContent>
    </Card>
  );
}

/* =======================
   ✅ Exported cards
======================= */

export function ClientsShortcutCard({ onClick, dragHandle }: ShortcutProps) {
  return (
    <ShortcutCard
      dataOnb="card-clients"
      icon={<GroupIcon sx={{ color: "#1d4ed8" }} />}
      iconBg="#eff6ff"
      title="Клієнти"
      subtitle=""
      desc={[
        <>
          Тут зберігається вся база твоїх клієнтів. Після додавання клієнта ти
          зможеш створювати для нього інвойси, комерційні пропозиції та акти — і
          відправляти їх прямо з додатку.
        </>,
      ]}
      onClick={onClick}
      dragHandle={dragHandle}
    />
  );
}

export function InvoicesShortcutCard({ onClick, dragHandle }: ShortcutProps) {
  return (
    <ShortcutCard
      dataOnb="card-invoices"
      icon={<ReceiptLongIcon sx={{ color: "#b45309" }} />}
      iconBg="#fef3c7"
      title="Інвойси"
      subtitle=""
      desc={[
        <>
          Створюй інвойси, керуй статусами (чернетка, відправлено, оплачено,
          скасовано), генеруй PDF або відправляй клієнту в один клік — без
          ручної рутини. Також можеш створювати міжнародні інвойси для роботи з
          клієнтами з-за кордону.
        </>,
      ]}
      onClick={onClick}
      dragHandle={dragHandle}
    />
  );
}

export function QuotesShortcutCard({ onClick, dragHandle }: ShortcutProps) {
  return (
    <ShortcutCard
      dataOnb="card-quotes"
      icon={<RequestQuoteIcon sx={{ color: "#047857" }} />}
      iconBg="#ecfdf5"
      title="Комерційні пропозиції"
      subtitle=""
      desc={[
        <>
          Створюй комерційні пропозиції з переліком послуг або товарів, цінами
          та умовами співпраці — щоб клієнту було легко прийняти рішення.
        </>,
      ]}
      onClick={onClick}
      dragHandle={dragHandle}
    />
  );
}

export function ActsShortcutCard({ onClick, dragHandle }: ShortcutProps) {
  return (
    <ShortcutCard
      dataOnb="card-acts"
      icon={<DescriptionIcon sx={{ color: "#0e7490" }} />}
      iconBg="#ecfeff"
      title="Акти"
      subtitle=""
      desc={[
        <>
          Створюй акти виконаних робіт з переліком послуг або робіт, сумами та
          даними клієнта — для клієнтів або бухгалтерії.
        </>,
      ]}
      onClick={onClick}
      dragHandle={dragHandle}
    />
  );
}

export function AnalyticsShortcutCard({ onClick, dragHandle }: ShortcutProps) {
  return (
    <ShortcutCard
      dataOnb="card-analytics"
      icon={<InsightsIcon sx={{ color: "#4f46e5" }} />}
      iconBg="#eef2ff"
      title="Аналітика"
      subtitle=""
      desc={[
        <>
          Вся фінансова аналітика формується автоматично на основі статусів
          інвойсів — отримано, в очікуванні або прострочено.
        </>,
      ]}
      onClick={onClick}
      dragHandle={dragHandle}
    />
  );
}
