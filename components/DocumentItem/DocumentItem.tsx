"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import DownloadIcon from "@mui/icons-material/Download";
import {
  Box,
  Chip,
  IconButton,
  Paper,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";

import {
  formatDateStable,
  formatSize,
  formatStatus,
  getStatusColor,
} from "../../app/knowledge-base/formatters";

type Doc = {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  status: string;
  description?: string | null;
  tags?: string[] | null;
};

type Props = {
  doc: Doc;
  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export function DocumentItem({ doc, onDelete, isDeleting }: Props) {
  const handleDownload = () => {
    // відкриваємо стрім як download
    window.open(
      `/api/kb/documents/${doc.id}/download`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Paper variant="outlined" sx={styles.root}>
      <Stack
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        alignItems={{ xs: "flex-start", md: "center" }}
        gap={1}
      >
        <Stack direction="row" gap={1.5} alignItems="center">
          <DescriptionIcon sx={{ color: "#4b5563" }} />
          <Stack>
            <Typography variant="body1" sx={styles.title}>
              {doc.title}
            </Typography>
            <Typography variant="caption" sx={styles.caption}>
              {doc.originalName} · {doc.mimeType}
            </Typography>
          </Stack>
        </Stack>

        <Stack direction="row" gap={1} alignItems="center" flexWrap="wrap">
          <Chip
            size="small"
            label={formatStatus(doc.status)}
            sx={{
              bgcolor: getStatusColor(doc.status),
              color: "#0f172a",
              fontSize: 11,
            }}
          />
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", minWidth: 140 }}
          >
            Розмір: {formatSize(doc.sizeBytes)}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", minWidth: 180 }}
          >
            Додано: {formatDateStable(doc.createdAt)}
          </Typography>

          <Tooltip title="Завантажити">
            <span>
              <IconButton
                size="small"
                onClick={handleDownload}
                disabled={doc.status !== "READY"} // ✅ можна качати тільки READY
              >
                <DownloadIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>

          <Tooltip title="Видалити документ">
            <span>
              <IconButton
                size="small"
                onClick={() => onDelete(doc.id)}
                disabled={isDeleting}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>
            </span>
          </Tooltip>
        </Stack>
      </Stack>

      {!!doc.description && (
        <Box mt={1}>
          <Typography variant="body2" sx={{ color: "#4b5563", fontSize: 13 }}>
            {doc.description}
          </Typography>
        </Box>
      )}

      {!!doc.tags?.length && (
        <Stack direction="row" gap={0.5} mt={1} flexWrap="wrap">
          {doc.tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              variant="outlined"
              sx={{
                borderColor: "#e5e7eb",
                color: "#6b7280",
                fontSize: 11,
              }}
            />
          ))}
        </Stack>
      )}
    </Paper>
  );
}

const styles = {
  root: {
    p: 1.5,
    borderRadius: 2,
    borderColor: "#e5e7eb",
    bgcolor: "#f9fafb",
  },
  title: { color: "#111827", fontWeight: 500 },
  caption: { color: "#9ca3af" },
} as const;
