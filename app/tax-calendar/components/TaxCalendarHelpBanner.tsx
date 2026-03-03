"use client";

import InfoOutlinedIcon from "@mui/icons-material/InfoOutlined";
import { Alert, Button, Stack, Typography } from "@mui/material";

export function TaxCalendarHelpBanner(props: {
  hasProfile: boolean;
  hasTemplates: boolean;
  hasEvents: boolean;
  onOpenSettings: () => void;
}) {
  const steps = [
    {
      ok: props.hasProfile,
      title: "1) Налаштуй профіль",
      text: "Обери тип (ФОП/ТОВ) і базові параметри оподаткування — це потрібно для генерації подій.",
      action: props.hasProfile
        ? null
        : { label: "Налаштувати", onClick: props.onOpenSettings },
    },
    {
      ok: props.hasTemplates,
      title: "2) Перевір шаблони",
      text: "Шаблони — це правила: як часто створювати події і коли дедлайн (наприклад: щокварталу +25 днів о 18:00).",
      action: props.hasTemplates
        ? null
        : { label: "Додати шаблон", onClick: props.onOpenSettings },
    },
    {
      ok: props.hasEvents,
      title: "3) Виконуй події",
      text: "Події зʼявляються на період, який вибраний в фільтрі дат. Натискай “Виконано” або “Пропустити”.",
      action: null,
    },
  ];

  return (
    <Alert
      icon={<InfoOutlinedIcon />}
      severity="info"
      sx={{
        borderRadius: "12px",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        bgcolor: "background.paper",
      }}
    >
      <Typography fontWeight={800} sx={{ mb: 1 }}>
        Як працює податковий календар
      </Typography>

      <Stack gap={1.25}>
        {steps.map((s) => (
          <Stack
            key={s.title}
            direction={{ xs: "column", sm: "row" }}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
            gap={1}
          >
            <Stack>
              <Typography fontWeight={700}>
                {s.ok ? "✅ " : "• "}
                {s.title}
              </Typography>
              <Typography fontSize={13} color="text.secondary">
                {s.text}
              </Typography>
            </Stack>

            {s.action ? (
              <Button
                onClick={s.action.onClick}
                variant="contained"
                size="small"
                sx={{ borderRadius: "999px", boxShadow: "none", flexShrink: 0 }}
              >
                {s.action.label}
              </Button>
            ) : null}
          </Stack>
        ))}
      </Stack>
    </Alert>
  );
}
