"use client";

import { Box, Typography } from "@mui/material";
import dayjs from "dayjs";
import { formatDateHuman } from "../utils";

export const TodoHeader = (props: {
  todayTasksCount: number;
  isTodayLoading: boolean;
}) => {
  const { todayTasksCount, isTodayLoading } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        gap: { xs: 1.5, md: 2 },
        mb: { xs: 3, md: 4 },
      }}
    >
      <Box
        sx={{ minWidth: { md: 220 }, textAlign: { xs: "left", md: "left" } }}
      >
        <Typography
          variant="caption"
          sx={{
            textTransform: "uppercase",
            color: "#9ca3af",
            fontWeight: 600,
            fontSize: { xs: 10, md: 11 },
          }}
        >
          СЬОГОДНІ
        </Typography>
        <Typography sx={{ fontWeight: 600, fontSize: { xs: 13, md: 14 } }}>
          {formatDateHuman(dayjs())}
        </Typography>
        <Typography
          variant="body2"
          sx={{ color: "#4b5563", mt: 0.5, fontSize: { xs: 12, md: 13 } }}
        >
          {isTodayLoading
            ? "Завантаження..."
            : `${todayTasksCount} задач(і) на сьогодні`}
        </Typography>
      </Box>
    </Box>
  );
};
