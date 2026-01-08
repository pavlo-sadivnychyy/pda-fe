"use client";

import {
  Box,
  Button,
  Dialog,
  DialogContent,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import type { Dayjs } from "dayjs";

import type { TodoPriority } from "../types";
import { formatDateHuman } from "../utils";

export const CreateTaskDialog = (props: {
  open: boolean;
  onClose: () => void;
  onSubmit: () => void;

  selectedDate: Dayjs;

  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  startTime: string;
  setStartTime: (v: string) => void;

  endTime: string; // "" = не задано
  setEndTime: (v: string) => void;

  priority: TodoPriority;
  setPriority: (v: TodoPriority) => void;

  isCreating: boolean;
}) => {
  const {
    open,
    onClose,
    onSubmit,
    selectedDate,
    title,
    setTitle,
    description,
    setDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    priority,
    setPriority,
    isCreating,
  } = props;

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
            TASKS
          </Typography>
        </Box>

        <Typography
          variant="h5"
          sx={{ fontWeight: 700, mb: 0.5, color: "#020617" }}
        >
          Нова задача
        </Typography>

        <Typography
          variant="body2"
          sx={{ color: "#6b7280", mb: 3, maxWidth: 520 }}
        >
          Створи задачу для{" "}
          <Box component="span" sx={{ fontWeight: 600, color: "#111827" }}>
            {formatDateHuman(selectedDate)}
          </Box>
          : задай назву, час(и), пріоритет та короткий опис.
        </Typography>

        <Stack spacing={2.5}>
          <TextField
            label="Назва задачі *"
            placeholder="Наприклад: Розібрати пошту та відповісти на листи"
            fullWidth
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            InputLabelProps={{ shrink: true }}
          />

          <Stack direction={{ xs: "column", sm: "row" }} spacing={2}>
            <TextField
              label="Початок"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              sx={{ width: { xs: "100%", sm: 180 } }}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Кінець (опціонально)"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              sx={{ width: { xs: "100%", sm: 180 } }}
              InputLabelProps={{ shrink: true }}
              helperText="Можна залишити пустим — тоді буде тільки час початку"
            />
          </Stack>

          <TextField
            label="Пріоритет"
            select
            value={priority}
            onChange={(e) => setPriority(e.target.value as TodoPriority)}
            InputLabelProps={{ shrink: true }}
          >
            <MenuItem value="LOW">Низький</MenuItem>
            <MenuItem value="MEDIUM">Середній</MenuItem>
            <MenuItem value="HIGH">Високий</MenuItem>
          </TextField>

          <TextField
            label="Опис (опціонально)"
            placeholder="Додаткові деталі, чекліст або контекст задачі"
            fullWidth
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            InputLabelProps={{ shrink: true }}
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
            disabled={isCreating}
            sx={{ textTransform: "none", color: "#6b7280" }}
          >
            Скасувати
          </Button>

          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={onSubmit}
            disabled={!title.trim() || isCreating}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              px: { xs: 2.5, md: 3 },
              bgcolor: "#111827",
              "&:hover": { bgcolor: "#020617" },
            }}
          >
            {isCreating ? "Збереження..." : "Додати задачу"}
          </Button>
        </Box>
      </DialogContent>
    </Dialog>
  );
};
