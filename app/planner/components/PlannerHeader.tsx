"use client";

import AddIcon from "@mui/icons-material/Add";
import AutorenewIcon from "@mui/icons-material/Autorenew";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { formatMonthLabel } from "../helpers";

type Props = {
  monthKey: string;
  monthOptions: string[];
  onMonthChange: (value: string) => void;
  onAddItem: () => void;
  onAddRule: () => void;
  onGenerateRecurring: () => void;
  generating: boolean;
};

export function PlannerHeader({
  monthKey,
  monthOptions,
  onMonthChange,
  onAddItem,
  onAddRule,
  onGenerateRecurring,
  generating,
}: Props) {
  return (
    <Paper elevation={0}>
      <Stack
        direction={{ xs: "column", xl: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "stretch", xl: "center" }}
        spacing={{ xs: 2, md: 2.5 }}
      >
        <Box sx={{ minWidth: 0, flex: 1 }}>
          <Stack
            direction="row"
            spacing={1}
            alignItems="center"
            flexWrap="wrap"
            useFlexGap
            mb={1}
          >
            <CalendarMonthIcon sx={{ color: "text.secondary", fontSize: 22 }} />

            <Typography
              variant="h4"
              fontWeight={800}
              sx={{
                fontSize: { xs: 28, md: 32 },
                lineHeight: 1.15,
              }}
            >
              Планувальник витрат
            </Typography>
          </Stack>

          <Typography
            variant="body1"
            color="text.secondary"
            sx={{
              maxWidth: 760,
              lineHeight: 1.5,
            }}
          >
            Керуй місячним бюджетом, дивись перевитрати по категоріях і аналізуй
            історію по минулих місяцях.
          </Typography>
        </Box>

        <Stack
          direction={{ xs: "column", sm: "row" }}
          spacing={1.25}
          alignItems="stretch"
          flexWrap="wrap"
          useFlexGap
          sx={{
            flexShrink: 0,
            width: { xs: "100%", xl: "auto" },
          }}
        >
          <Select
            size="small"
            value={monthKey}
            onChange={(e) => onMonthChange(String(e.target.value))}
            sx={{
              minWidth: { xs: "100%", sm: 220 },
              height: 44,
              borderRadius: 3,
              bgcolor: "background.paper",
              "& .MuiSelect-select": {
                display: "flex",
                alignItems: "center",
                minHeight: "44px",
                py: 0,
              },
            }}
          >
            {monthOptions.map((key) => (
              <MenuItem key={key} value={key}>
                {formatMonthLabel(key)}
              </MenuItem>
            ))}
          </Select>

          <Button
            variant="outlined"
            startIcon={<AutorenewIcon />}
            onClick={onGenerateRecurring}
            disabled={generating}
            size="small"
            sx={{
              height: 44,
              px: 2,
              borderRadius: 3,
              whiteSpace: "nowrap",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "black",
              color: "white",
              border: "none",
            }}
          >
            Підтягнути регулярні
          </Button>

          <Button
            variant="outlined"
            onClick={onAddRule}
            size="small"
            sx={{
              height: 44,
              px: 2,
              borderRadius: 3,
              whiteSpace: "nowrap",
              textTransform: "none",
              fontWeight: 600,
              backgroundColor: "black",
              color: "white",
              border: "none",
            }}
          >
            Нова регулярна
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onAddItem}
            size="small"
            sx={{
              height: 44,
              px: 2.25,
              borderRadius: 3,
              whiteSpace: "nowrap",
              textTransform: "none",
              fontWeight: 700,
              boxShadow: "none",
              backgroundColor: "black",
              color: "white",
              border: "none",
            }}
          >
            Додати витрату
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
