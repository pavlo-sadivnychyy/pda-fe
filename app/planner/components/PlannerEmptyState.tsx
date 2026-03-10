"use client";

import AddIcon from "@mui/icons-material/Add";
import { Button, Paper, Typography } from "@mui/material";

type Props = {
  onCreate: () => void;
};

export function PlannerEmptyState({ onCreate }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        p: 4,
        textAlign: "center",
      }}
    >
      <Typography variant="h6" fontWeight={800} mb={1}>
        У цьому місяці поки що немає витрат
      </Typography>

      <Typography variant="body2" color="text.secondary" mb={3}>
        Додай першу планову або фактичну витрату, щоб побачити аналітику та
        історію.
      </Typography>

      <Button
        variant="contained"
        startIcon={<AddIcon />}
        onClick={onCreate}
        sx={{ borderRadius: 999, bgcolor: "black", color: "white" }}
      >
        Додати витрату
      </Button>
    </Paper>
  );
}
