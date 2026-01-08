"use client";

import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Divider,
  IconButton,
  Stack,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

import type { TodoTask } from "../types";
import {
  formatTime,
  priorityColor,
  statusChipStyles,
  statusLabel,
} from "../utils";

export const TasksList = (props: {
  tasks: TodoTask[];
  isLoading: boolean;
  isFetching: boolean;
  isDeleting: boolean;
  onAdd: () => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: TodoTask) => void;
}) => {
  const {
    tasks,
    isLoading,
    isFetching,
    isDeleting,
    onAdd,
    onDelete,
    onToggleStatus,
  } = props;

  return (
    <Box
      sx={{
        mt: 1,
        bgcolor: "#f9fafb",
        borderRadius: 3,
        p: { xs: 1.75, md: 2.5 },
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: { xs: "column", sm: "row" },
          justifyContent: "space-between",
          alignItems: { xs: "flex-start", sm: "center" },
          gap: { xs: 1, sm: 0 },
          mb: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{ fontWeight: 600, fontSize: { xs: 14, md: 16 } }}
        >
          Задачі на день
        </Typography>

        <Box
          sx={{
            display: "flex",
            alignItems: "center",
            gap: 1.5,
            width: { xs: "100%", sm: "auto" },
            justifyContent: { xs: "space-between", sm: "flex-end" },
          }}
        >
          {isLoading || isFetching ? (
            <CircularProgress size={18} />
          ) : (
            <Typography
              variant="body2"
              sx={{ color: "#6b7280", fontSize: { xs: 12, md: 13 } }}
            >
              {tasks.length === 0
                ? "Ще немає задач"
                : `${tasks.length} задач(і)`}
            </Typography>
          )}

          <Button
            variant="outlined"
            size="small"
            startIcon={<AddIcon />}
            onClick={onAdd}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              borderColor: "#020617",
              color: "#020617",
              fontWeight: 500,
              fontSize: { xs: 12, md: 13 },
              "&:hover": { borderColor: "#020617", bgcolor: "#e5e7eb" },
              whiteSpace: "nowrap",
            }}
          >
            Додати задачу
          </Button>
        </Box>
      </Box>

      <Divider sx={{ mb: 2 }} />

      <Stack spacing={1.5}>
        {tasks.map((task) => (
          <Box
            key={task.id}
            sx={{
              display: "flex",
              alignItems: "flex-start",
              gap: 1.25,
              p: { xs: 1.25, md: 1.5 },
              borderRadius: 2,
              bgcolor: "#ffffff",
              border: "1px solid #e5e7eb",
            }}
          >
            <Box sx={{ minWidth: 48 }}>
              <Typography
                variant="body2"
                sx={{
                  fontWeight: 600,
                  color: "#111827",
                  fontSize: { xs: 12, md: 13 },
                }}
              >
                {formatTime(task.startAt)}
              </Typography>
            </Box>

            <Box sx={{ flex: 1 }}>
              <Typography
                variant="body2"
                sx={{ fontWeight: 600, mb: 0.5, fontSize: { xs: 13, md: 14 } }}
              >
                {task.title}
              </Typography>

              {task.description && (
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontSize: { xs: 12, md: 13 } }}
                >
                  {task.description}
                </Typography>
              )}

              <Box
                sx={{ mt: 0.75, display: "flex", flexWrap: "wrap", gap: 0.75 }}
              >
                <Chip
                  size="small"
                  label={
                    task.priority === "HIGH"
                      ? "Високий пріоритет"
                      : task.priority === "LOW"
                        ? "Низький пріоритет"
                        : "Середній пріоритет"
                  }
                  sx={{
                    height: 22,
                    bgcolor: "#f3f4f6",
                    color: priorityColor(task.priority),
                    fontSize: 11,
                    fontWeight: 500,
                  }}
                />

                <Chip
                  size="small"
                  label={statusLabel(task.status)}
                  onClick={() => onToggleStatus(task)}
                  sx={statusChipStyles(task.status)}
                />
              </Box>
            </Box>

            <IconButton
              size="small"
              disabled={isDeleting}
              onClick={() => onDelete(task.id)}
              sx={{ mt: 0.25 }}
            >
              <DeleteOutlineIcon sx={{ fontSize: 18 }} />
            </IconButton>
          </Box>
        ))}

        {tasks.length === 0 && !isLoading && !isFetching && (
          <Typography
            variant="body2"
            sx={{
              color: "#9ca3af",
              textAlign: "center",
              mt: 2,
              fontSize: { xs: 12, md: 13 },
            }}
          >
            На цю дату ще нічого не заплановано.
          </Typography>
        )}
      </Stack>
    </Box>
  );
};
