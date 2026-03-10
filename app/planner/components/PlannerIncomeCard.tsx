"use client";

import { useEffect, useState } from "react";
import {
  Button,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";

type Props = {
  currency: string;
  incomePlanned?: string | null;
  incomeActual?: string | null;
  notes?: string | null;
  onSave: (payload: {
    incomePlanned?: number;
    incomeActual?: number;
    notes?: string;
  }) => Promise<void>;
  loading?: boolean;
};

export function PlannerIncomeCard({
  currency,
  incomePlanned,
  incomeActual,
  notes,
  onSave,
  loading,
}: Props) {
  const [planned, setPlanned] = useState("");
  const [actual, setActual] = useState("");
  const [localNotes, setLocalNotes] = useState("");

  useEffect(() => {
    setPlanned(incomePlanned ? String(Number(incomePlanned)) : "");
    setActual(incomeActual ? String(Number(incomeActual)) : "");
    setLocalNotes(notes ?? "");
  }, [incomePlanned, incomeActual, notes]);

  const handleSave = async () => {
    await onSave({
      incomePlanned: planned === "" ? 0 : Number(planned),
      incomeActual: actual === "" ? 0 : Number(actual),
      notes: localNotes || undefined,
    });
  };

  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        p: 3,
      }}
    >
      <Stack spacing={2}>
        <Typography variant="h6" fontWeight={800}>
          Дохід за місяць
        </Typography>

        <Grid container spacing={2}>
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={`Запланований дохід (${currency})`}
              value={planned}
              onChange={(e) => setPlanned(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              type="number"
              label={`Фактичний дохід (${currency})`}
              value={actual}
              onChange={(e) => setActual(e.target.value)}
            />
          </Grid>

          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              label="Нотатка"
              value={localNotes}
              onChange={(e) => setLocalNotes(e.target.value)}
            />
          </Grid>
        </Grid>

        <Stack direction="row" justifyContent="flex-end">
          <Button
            variant="contained"
            onClick={handleSave}
            disabled={loading}
            sx={{ borderRadius: 999, bgcolor: "black", color: "white" }}
          >
            Зберегти дохід
          </Button>
        </Stack>
      </Stack>
    </Paper>
  );
}
