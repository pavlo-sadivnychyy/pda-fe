"use client";

import DescriptionIcon from "@mui/icons-material/Description";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, RefObject } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  onCreate: () => void;

  disabled: boolean;
  isUploading: boolean;

  title: string;
  setTitle: (v: string) => void;

  description: string;
  setDescription: (v: string) => void;

  tags: string;
  setTags: (v: string) => void;

  file: File | null;

  // ✅ отримуємо ref з хука
  inputRef: RefObject<HTMLInputElement>;
  onPickFile: () => void;
  onFileChange: (e: ChangeEvent<HTMLInputElement>) => void;

  uploadError?: string;
};

export function CreateDocumentDialog(props: Props) {
  const {
    open,
    onClose,
    onCreate,
    disabled,
    isUploading,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    file,
    inputRef,
    onPickFile,
    onFileChange,
    uploadError,
  } = props;

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ px: 3, pt: 3, pb: 1 }}>
        <Stack spacing={1}>
          <Chip label="Knowledge base" size="small" sx={styles.pill} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
            Додати документ
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Завантаж документ, додай назву, опис та теги — асистент буде
            використовувати його для відповідей.
          </Typography>
        </Stack>
      </DialogTitle>

      <DialogContent sx={{ pt: 2, px: 3, pb: 1 }}>
        <Stack spacing={2.5} sx={{ paddingTop: "5px" }}>
          <TextField
            label="Назва документа"
            fullWidth
            size="small"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Наприклад: Договір з клієнтом (шаблон)"
            InputLabelProps={{ shrink: true }}
          />

          {/* ✅ Стабільна кнопка вибору файлу */}
          <Button
            variant="outlined"
            fullWidth
            onClick={onPickFile}
            sx={styles.fileBtn}
          >
            <Stack
              direction="row"
              spacing={1.5}
              alignItems="center"
              sx={{ width: "100%" }}
            >
              <DescriptionIcon sx={{ color: "#6b7280" }} />
              <Box sx={{ flex: 1, textAlign: "left" }}>
                <Typography
                  variant="body2"
                  sx={{ color: "#111827", fontWeight: 500 }}
                >
                  {file ? file.name : "Обрати файл"}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{ color: "#9ca3af", fontSize: 11 }}
                >
                  Підтримуються PDF, DOCX та TXT
                </Typography>
              </Box>
            </Stack>
          </Button>

          {/* hidden input */}
          <input
            ref={inputRef}
            type="file"
            hidden
            accept=".pdf,.doc,.docx,.txt,.xls,.xlsx"
            onChange={onFileChange}
          />

          <TextField
            label="Опис"
            fullWidth
            size="small"
            multiline
            minRows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Наприклад: Основний шаблон договору з клієнтами"
            InputLabelProps={{ shrink: true }}
          />

          <TextField
            label="Теги (через кому)"
            fullWidth
            size="small"
            value={tags}
            onChange={(e) => setTags(e.target.value)}
            placeholder="contract, legal, offer"
            InputLabelProps={{ shrink: true }}
          />

          {uploadError && (
            <Typography variant="body2" color="#b91c1c">
              Помилка завантаження: {uploadError}
            </Typography>
          )}
        </Stack>
      </DialogContent>

      <DialogActions
        sx={{
          px: 3,
          pb: 3,
          pt: 1,
          borderTop: "1px solid #e5e7eb",
          display: "flex",
          justifyContent: "space-between",
          gap: 1.5,
        }}
      >
        <Button
          onClick={onClose}
          disabled={isUploading}
          sx={{ textTransform: "none", borderRadius: 999 }}
        >
          Скасувати
        </Button>

        <Button
          onClick={onCreate}
          variant="contained"
          disabled={disabled || !file || isUploading}
          sx={styles.primary}
        >
          {isUploading ? (
            <Stack direction="row" alignItems="center" gap={1}>
              <CircularProgress size={16} />
              <span>Завантажуємо…</span>
            </Stack>
          ) : (
            "Додати документ"
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

const styles = {
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    bgcolor: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 500,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  fileBtn: {
    justifyContent: "flex-start",
    borderRadius: 2,
    borderColor: "#e5e7eb",
    bgcolor: "#f9fafb",
    textTransform: "none",
    fontSize: 14,
    "&:hover": {
      borderColor: "#d1d5db",
      bgcolor: "#f3f4f6",
    },
  },
  primary: {
    textTransform: "none",
    borderRadius: 999,
    bgcolor: "#111827",
    boxShadow: "none",
    color: "white",
    "&:hover": {
      bgcolor: "#000000",
      boxShadow: "none",
    },
  },
} as const;
