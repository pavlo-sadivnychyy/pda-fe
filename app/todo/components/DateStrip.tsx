"use client";

import { Box, Button, IconButton, Typography } from "@mui/material";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import dayjs, { Dayjs } from "dayjs";

import { formatDateHuman } from "../utils";

export const DateStrip = (props: {
  days: Dayjs[];
  selectedDate: Dayjs;
  onSelect: (d: Dayjs) => void;
  onPrev: () => void;
  onNext: () => void;
  onToday: () => void;
}) => {
  const { days, selectedDate, onSelect, onPrev, onNext, onToday } = props;

  return (
    <Box sx={{ mb: { xs: 2.5, md: 3 } }}>
      <Typography
        variant="caption"
        sx={{
          color: "#9ca3af",
          fontWeight: 600,
          letterSpacing: 0.4,
          fontSize: { xs: 10, md: 11 },
        }}
      >
        ОБЕРИ ДЕНЬ
      </Typography>

      <Box
        sx={{
          mt: 1.5,
          pb: { xs: 0.5, md: 1 },
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          gap: { xs: 1, sm: 1 },
          alignItems: { xs: "stretch", sm: "center" },
          width: "100%",
        }}
      >
        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1,
            width: { xs: "100%", sm: "auto" },
          }}
        >
          <IconButton
            size="small"
            onClick={onPrev}
            sx={{
              bgcolor: "#e5e7eb",
              "&:hover": { bgcolor: "#d4d4d8" },
              width: 32,
              height: 32,
            }}
          >
            <ChevronLeftIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <IconButton
            size="small"
            onClick={onNext}
            sx={{
              bgcolor: "#e5e7eb",
              "&:hover": { bgcolor: "#d4d4d8" },
              width: 32,
              height: 32,
            }}
          >
            <ChevronRightIcon sx={{ fontSize: 18 }} />
          </IconButton>

          <Button
            size="small"
            onClick={onToday}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: 2,
              bgcolor: "#e5e7eb",
              color: "#111827",
              fontSize: { xs: 11, md: 12 },
              "&:hover": { bgcolor: "#d4d4d8" },
              whiteSpace: "nowrap",
            }}
          >
            Сьогодні
          </Button>
        </Box>

        <Box
          sx={{
            display: "flex",
            overflowX: "auto",
            gap: 1,
            flex: 1,
            minWidth: 0,
            maxWidth: "100%",
            px: 0.5,
          }}
        >
          {days.map((d) => {
            const isSelected = d.isSame(selectedDate, "day");
            return (
              <Button
                key={d.toISOString()}
                onClick={() => onSelect(d)}
                sx={{
                  minWidth: { xs: 60, sm: 72 },
                  borderRadius: 999,
                  flexDirection: "column",
                  alignItems: "center",
                  px: { xs: 1, sm: 1.5 },
                  py: { xs: 0.75, sm: 1 },
                  bgcolor: isSelected ? "#020617" : "#f3f4f6",
                  color: isSelected ? "#f9fafb" : "#111827",
                  textTransform: "none",
                  "&:hover": { bgcolor: isSelected ? "#020617" : "#e5e7eb" },
                  flexShrink: 0,
                  boxSizing: "border-box",
                }}
              >
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: 9, sm: 10 }, opacity: 0.8 }}
                >
                  {d.format("dd").toUpperCase()}
                </Typography>
                <Typography
                  sx={{
                    fontWeight: 600,
                    lineHeight: 1.1,
                    fontSize: { xs: 13, sm: 14 },
                  }}
                >
                  {d.format("DD")}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ fontSize: { xs: 9, sm: 10 }, opacity: 0.8 }}
                >
                  {d.format("MMM").toUpperCase()}
                </Typography>
              </Button>
            );
          })}
        </Box>
      </Box>

      <Typography
        variant="body2"
        sx={{ mt: 1.5, color: "#6b7280", fontSize: { xs: 12, md: 13 } }}
      >
        Обрана дата:{" "}
        <Box component="span" sx={{ fontWeight: 600, color: "#111827" }}>
          {formatDateHuman(selectedDate)}
        </Box>
      </Typography>

      <Typography
        variant="caption"
        sx={{ display: "block", mt: 0.5, color: "#9ca3af" }}
      >
        Сьогодні: {formatDateHuman(dayjs())}
      </Typography>
    </Box>
  );
};
