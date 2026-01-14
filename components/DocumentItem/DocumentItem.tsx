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
} from "@/app/knowledge-base/formatters";

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
    window.open(
      `/api/kb/documents/${doc.id}/download`,
      "_blank",
      "noopener,noreferrer",
    );
  };

  return (
    <Paper variant="outlined" sx={styles.root}>
      {/* HEADER */}
      <Stack direction="row" spacing={1.5} alignItems="flex-start">
        <DescriptionIcon sx={{ color: "#4b5563", mt: "2px" }} />

        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Typography sx={styles.title} noWrap>
            {doc.title}
          </Typography>
          <Typography sx={styles.caption} noWrap>
            {doc.originalName}
          </Typography>
        </Box>

        <Chip
          size="small"
          label={formatStatus(doc.status)}
          sx={{
            bgcolor: getStatusColor(doc.status),
            color: "#0f172a",
            fontSize: 11,
            flexShrink: 0,
          }}
        />
      </Stack>

      {/* META */}
      <Stack
        direction="row"
        spacing={2}
        mt={1}
        sx={{
          fontSize: 12,
          color: "#6b7280",
          flexWrap: "wrap",
        }}
      >
        <Typography variant="caption">
          📦 {formatSize(doc.sizeBytes)}
        </Typography>
        <Typography variant="caption">
          📅 {formatDateStable(doc.createdAt)}
        </Typography>
      </Stack>

      {/* DESCRIPTION */}
      {!!doc.description && (
        <Typography mt={1} sx={styles.description}>
          {doc.description}
        </Typography>
      )}

      {/* TAGS */}
      {!!doc.tags?.length && (
        <Stack direction="row" gap={0.5} mt={1} flexWrap="wrap">
          {doc.tags.map((tag) => (
            <Chip
              key={tag}
              size="small"
              label={tag}
              variant="outlined"
              sx={styles.tag}
            />
          ))}
        </Stack>
      )}

      {/* ACTIONS */}
      <Stack
        direction="row"
        justifyContent="space-between"
        mt={1.5}
        sx={{
          borderTop: "1px solid #e5e7eb",
          pt: 1,
        }}
      >
        <Tooltip title="Завантажити">
          <span>
            <IconButton
              onClick={handleDownload}
              disabled={doc.status !== "READY"}
              sx={styles.actionBtn}
            >
              <DownloadIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>

        <Tooltip title="Видалити">
          <span>
            <IconButton
              onClick={() => onDelete(doc.id)}
              disabled={isDeleting}
              sx={styles.actionBtn}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </span>
        </Tooltip>
      </Stack>
    </Paper>
  );
}

const styles = {
  root: {
    p: { xs: 1.5, sm: 2 },
    borderRadius: 3,
    borderColor: "#e5e7eb",
    bgcolor: "#f9fafb",
  },

  title: {
    color: "#111827",
    fontWeight: 600,
    fontSize: { xs: 14, sm: 15 },
    lineHeight: 1.2,
  },

  caption: {
    color: "#9ca3af",
    fontSize: 12,
  },

  description: {
    color: "#4b5563",
    fontSize: 13,
    lineHeight: 1.4,
  },

  tag: {
    borderColor: "#e5e7eb",
    color: "#6b7280",
    fontSize: 11,
  },

  actionBtn: {
    bgcolor: "#ffffff",
    border: "1px solid #e5e7eb",
    borderRadius: 2,
    px: 1.5,
  },
} as const;
