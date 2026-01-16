"use client";

import * as React from "react";
import {
  Button,
  Card,
  CardContent,
  CardHeader,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Box,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import { InfinitySpin } from "react-loader-spinner";

type Props = {
  isLoading: boolean;
  profileCompletion: number;
  hasNiche: boolean;
  hasServices: boolean;
  hasAudience: boolean;
  hasBrandStyle: boolean;
  buttonLabel: string;
  onOpenProfile: () => void;

  // ✅ NEW
  dragHandle?: React.ReactNode;
};

export function BusinessProfileCard({
  isLoading,
  profileCompletion,
  hasNiche,
  hasServices,
  hasAudience,
  hasBrandStyle,
  buttonLabel,
  onOpenProfile,
  dragHandle,
}: Props) {
  const missingAny =
    !hasNiche || !hasServices || !hasAudience || !hasBrandStyle;

  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Профіль вашого бізнесу
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Ці дані використовуються асистентом для більш точних відповідей,
            текстів та рекомендацій.
          </Typography>
        }
        sx={{ pb: 0 }}
        action={<Box sx={{ mr: 1 }}>{dragHandle}</Box>}
      />

      <CardContent sx={{ pt: 2 }}>
        {isLoading ? (
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
              Оновлюємо дані профілю...
            </Typography>
          </Box>
        ) : (
          <Stack spacing={2}>
            <Stack direction="row" alignItems="center" spacing={1}>
              <Typography variant="body2" sx={{ color: "text.secondary" }}>
                Заповнено
              </Typography>
              <Typography variant="body2" sx={{ fontWeight: 600 }}>
                {profileCompletion}%
              </Typography>
            </Stack>

            <LinearProgress
              variant="determinate"
              value={profileCompletion}
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "#e5e7eb",
                "& .MuiLinearProgress-bar": {
                  borderRadius: 999,
                  bgcolor: "#202124",
                },
              }}
            />

            {missingAny && (
              <List dense sx={{ mt: 1 }}>
                <Row
                  ok={hasNiche}
                  title="Ніша бізнесу"
                  hint="Чим конкретніше — тим краще"
                />
                <Row
                  ok={hasServices}
                  title="Опис послуг"
                  hint="Які послуги/продукти ви пропонуєте"
                />
                <Row
                  ok={hasAudience}
                  title="Цільова аудиторія"
                  hint="Кому саме ви продаєте / для кого контент"
                />
                <Row
                  ok={hasBrandStyle}
                  title="Брендовий стиль та tone of voice"
                  hint="Як ви хочете звучати в текстах"
                />
              </List>
            )}

            <Button
              variant="outlined"
              onClick={onOpenProfile}
              sx={{
                mt: 0.5,
                borderRadius: 999,
                textTransform: "none",
                fontWeight: 700,
                border: "none",
                boxShadow: "none",
                bgcolor: "#111827",
                "&:hover": { bgcolor: "#1f2937", boxShadow: "none" },
                color: "white",
              }}
            >
              {buttonLabel}
            </Button>
          </Stack>
        )}
      </CardContent>
    </Card>
  );
}

function Row({
  ok,
  title,
  hint,
}: {
  ok: boolean;
  title: string;
  hint: string;
}) {
  return (
    <ListItem disableGutters>
      <ListItemIcon sx={{ minWidth: 32 }}>
        {ok ? (
          <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
        ) : (
          <RadioButtonUncheckedIcon sx={{ fontSize: 18, color: "#9ca3af" }} />
        )}
      </ListItemIcon>
      <ListItemText primary={title} secondary={ok ? undefined : hint} />
    </ListItem>
  );
}
