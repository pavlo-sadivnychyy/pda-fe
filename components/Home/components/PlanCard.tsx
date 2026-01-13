"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
} from "@mui/material";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";

export type PlanId = "FREE" | "BASIC" | "PRO";

type Props = {
  currentPlan?: PlanId | null;
  hintText?: string | null;
};

export function PlanCard({ currentPlan = null, hintText = null }: Props) {
  const planLabel = currentPlan ?? "…";

  return (
    <Card data-onb="card-plan" elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={<WorkspacePremiumIcon sx={{ color: "#f97316" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Плани та підписка
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Апгрейд дає аналітику, експорт та автоматичні нагадування.
          </Typography>
        }
        sx={{ pb: 0 }}
      />

      <CardContent sx={{ pt: 1.5 }}>
        <Stack spacing={1.5}>
          <Stack
            direction="row"
            alignItems="center"
            justifyContent="space-between"
            spacing={2}
          >
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Поточний план: <b>{planLabel}</b>
              {currentPlan === "FREE"
                ? " — спробуй, а потім апгрейднись."
                : null}
            </Typography>

            <Button
              component={Link}
              href="/pricing"
              size="small"
              variant="contained"
              sx={{
                textTransform: "none",
                borderRadius: 999,
                bgcolor: "#202124",
                "&:hover": { bgcolor: "#111827" },
                fontSize: 12,
                px: 2,
                whiteSpace: "nowrap",
              }}
            >
              Переглянути плани
            </Button>
          </Stack>

          {hintText && (
            <Typography variant="body2" sx={{ color: "#b45309", mt: 0.5 }}>
              {hintText}
            </Typography>
          )}

          <Box
            sx={{
              bgcolor: "#fefce8",
              borderRadius: 2,
              p: 1.5,
              border: "1px solid #facc15",
            }}
          >
            <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 0.5 }}>
              Що дає апгрейд
            </Typography>

            <List dense sx={{ py: 0 }}>
              <ListItem disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      Аналітика: дохід, unpaid, динаміка по періодах
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      Експорт CSV/XLSX та PDF без watermark
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      Авто-нагадування про оплату та дедлайни задач (PRO)
                    </Typography>
                  }
                />
              </ListItem>

              <ListItem disableGutters sx={{ py: 0.25 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon sx={{ fontSize: 18, color: "#16a34a" }} />
                </ListItemIcon>
                <ListItemText
                  primary={
                    <Typography variant="body2" sx={{ color: "#4b5563" }}>
                      Кастомні шаблони PDF: логотип, реквізити, стиль (PRO)
                    </Typography>
                  }
                />
              </ListItem>
            </List>
          </Box>

          <Typography variant="caption" sx={{ color: "text.secondary" }}>
            BASIC — $15/міс (найпопулярніший), PRO — $30/міс (максимум
            можливостей).
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
