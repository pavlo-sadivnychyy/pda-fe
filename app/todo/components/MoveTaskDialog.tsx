"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import type { TodoTask } from "../types";

export const MoveTaskDialog = (props: {
  open: boolean;
  task: TodoTask | null;
  date: string; // YYYY-MM-DD
  setDate: (v: string) => void;
  onClose: () => void;
  onMove: () => void;
  isMoving: boolean;
}) => {
  const { open, task, date, setDate, onClose, onMove, isMoving } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4, p: 0 } }}
    >
      <DialogContent sx={{ padding: "24px" }}>
        <Box
          sx={{
            display: "inline-flex",
            px: 1.5,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "#f3f4f6",
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: 0.8, fontWeight: 600, color: "#6b7280" }}
          >
            MOVE TASK
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
        >
          Перенести задачу
        </Typography>

        <Typography variant="body2" sx={{ color: "#6b7280", mb: 3 }}>
          {task ? (
            <>
              Обери новий день для:{" "}
              <Box component="span" sx={{ fontWeight: 700, color: "#111827" }}>
                {task.title}
              </Box>
            </>
          ) : (
            "Обери новий день"
          )}
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="Новий день"
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            InputLabelProps={{ shrink: true }}
            helperText="Час і тривалість збережуться"
          />
        </Stack>

        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mt: 4,
            gap: 2,
          }}
        >
          <Button
            onClick={onClose}
            disabled={isMoving}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Скасувати
          </Button>

          <Button
            variant="contained"
            onClick={onMove}
            disabled={!date || isMoving || !task}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: { xs: 2.5, md: 3 },
              bgcolor: "#111827",
              color: "white",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            {isMoving ? "Переносимо..." : "Перенести"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
