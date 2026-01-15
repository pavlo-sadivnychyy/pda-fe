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

type Props = {
  onOpenClients: () => void;
  onOpenInvoices: () => void;
  onOpenQuotes: () => void;
  onOpenActs: () => void;
  onOpenAnalytics: () => void;
};

export function FinanceShortcutsCards({
  onOpenClients,
  onOpenInvoices,
  onOpenQuotes,
  onOpenActs,
  onOpenAnalytics,
}: Props) {
  return (
    <Stack spacing={3} sx={{ mb: 3 }}>
      <ShortcutCard
        icon={<GroupIcon sx={{ color: "#1d4ed8" }} />}
        iconBg="#eff6ff"
        title="Клієнти"
        subtitle=""
        desc={[
          <>
            Тут зберігається вся база твоїх клієнтів. Після додавання клієнта ти
            зможеш створювати для нього інвойси, комерційні пропозиції та акти —
            і відправляти їх прямо з додатку.
          </>,
        ]}
        onClick={onOpenClients}
        dataOnb="card-clients"
      />

      <ShortcutCard
        icon={<ReceiptLongIcon sx={{ color: "#b45309" }} />}
        iconBg="#fef3c7"
        title="Інвойси"
        subtitle=""
        desc={[
          <>
            Створюй інвойси, керуй статусами (чернетка, відправлено, оплачено,
            скасовано), генеруй PDF або відправляй клієнту в один клік — без
            ручної рутини. Також можеш створювати міжнародні інвойси для роботи
            з клієнтами з-за кордону.
          </>,

          // // warning-блок
          // <Box sx={{ display: "flex", alignItems: "flex-start", gap: 0.8 }}>
          //   <ErrorOutlineIcon
          //     color={"warning"}
          //     sx={{ fontSize: 18, mt: "2px" }}
          //   />
          //   <Typography variant="body2" sx={{ color: "text.secondary" }}>
          //     Для формування <strong>повного інвойсу з реквізитами</strong>{" "}
          //     додай
          //     <strong> платіжні реквізити</strong> в профілі організації.
          //   </Typography>
          // </Box>,
        ]}
        onClick={onOpenInvoices}
        dataOnb="card-invoices"
      />

      <ShortcutCard
        icon={<RequestQuoteIcon sx={{ color: "#047857" }} />}
        iconBg="#ecfdf5"
        title="Комерційні пропозиції"
        subtitle=""
        desc={[
          <>
            Створюй комерційні пропозиції з переліком послуг або товарів, цінами
            та умовами співпраці — щоб клієнту було легко прийняти рішення.
          </>,

          // <>
          //   <strong>Керуй статусами</strong>:
          //   <strong> в роботі, на погодженні, прийнято, відхилено</strong> — і
          //   завжди розумій, на якому етапі кожна угода.
          // </>,
          //
          // <>
          //   У разі погодження <strong>перетворюй пропозицію в інвойс</strong>{" "}
          //   одним кліком — без дублювання даних.
          // </>,
        ]}
        button="Відкрити пропозиції"
        onClick={onOpenQuotes}
        dataOnb="card-quotes"
      />

      <ShortcutCard
        icon={<DescriptionIcon sx={{ color: "#0e7490" }} />}
        iconBg="#ecfeff"
        title="Акти"
        subtitle=""
        desc={[
          <>
            Створюй акти виконаних робіт з переліком послуг або робіт, сумами та
            даними клієнта — для клієнтів або бухгалтерії.
          </>,

          // <>
          //   <strong>Зберігай PDF-версії</strong> актів та
          //   <strong> завантажуй їх у будь-який момент</strong> — щоб завжди мати
          //   підтвердження виконання.
          // </>,
          //
          // <>
          //   Підтримуй <strong>порядок у документах</strong> — усі акти доступні
          //   в одному місці без пошуку в пошті чи чатах.
          // </>,
        ]}
        button="Перейти до актів"
        onClick={onOpenActs}
        dataOnb="card-acts"
      />

      <ShortcutCard
        icon={<InsightsIcon sx={{ color: "#4f46e5" }} />}
        iconBg="#eef2ff"
        title="Аналітика"
        subtitle=""
        desc={[
          <>
            Вся фінансова аналітика формується автоматично на основі статусів
            інвойсів — отримано, в очікуванні або прострочено.
          </>,

          // <>
          //   <strong>Бач фінансову картину за період</strong>: скільки отримано,
          //   скільки ще очікується та що потребує уваги.
          // </>,
          //
          // <>
          //   <strong>Візуалізація допомагає приймати рішення</strong> — кому
          //   нагадати про оплату, що закрити зараз і де просідає кеш-флоу.
          // </>,
        ]}
        button="Перейти до аналітики"
        onClick={onOpenAnalytics}
        dataOnb="card-analytics"
      />
    </Stack>
  );
}

function ShortcutCard({
  icon,
  iconBg,
  title,
  subtitle,
  desc,
  onClick,
  dataOnb,
}: {
  icon: React.ReactNode;
  iconBg: string;
  title: string;
  subtitle: string;
  desc: React.ReactNode[];
  onClick: () => void;
  dataOnb?: string;
}) {
  return (
    <Card data-onb={dataOnb} elevation={3} sx={{ borderRadius: 3 }}>
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
          subtitle && (
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              {subtitle}
            </Typography>
          )
        }
        // ✅ КНОПКА СПРАВА
        action={
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
            }}
          >
            Перейти
          </Button>
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
