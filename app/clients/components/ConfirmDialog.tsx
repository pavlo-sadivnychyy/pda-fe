"use client";

import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from "@mui/material";

export const ConfirmDialog = ({
  open,
  title,
  description,
  confirmText = "Підтвердити",
  cancelText = "Скасувати",
  loading,
  onClose,
  onConfirm,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 4 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent sx={{ pt: 0 }}>
        {description ? (
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            {description}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none", color: "#6b7280" }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color="error"
          onClick={() => {
            onConfirm();
            onClose();
          }}
          disabled={loading}
          sx={{ textTransform: "none", borderRadius: 999, px: 2.5 }}
        >
          {loading ? "Видаляємо..." : confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
