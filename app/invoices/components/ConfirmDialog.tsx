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
  confirmColor = "error",
  loading,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description?: string;
  confirmText?: string;
  cancelText?: string;
  confirmColor?:
    | "error"
    | "primary"
    | "inherit"
    | "success"
    | "warning"
    | "info";
  loading?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) => {
  return (
    <Dialog
      open={open}
      onClose={loading ? undefined : onClose}
      maxWidth="xs"
      fullWidth
      PaperProps={{ sx: { borderRadius: 3 } }}
    >
      <DialogTitle sx={{ fontWeight: 700 }}>{title}</DialogTitle>
      <DialogContent>
        {description ? (
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            {description}
          </Typography>
        ) : null}
      </DialogContent>
      <DialogActions sx={{ px: 3, pb: 2 }}>
        <Button
          onClick={onClose}
          disabled={loading}
          sx={{ textTransform: "none" }}
        >
          {cancelText}
        </Button>
        <Button
          variant="contained"
          color={confirmColor}
          onClick={onConfirm}
          disabled={loading}
          sx={{ textTransform: "none", borderRadius: 999, px: 2.5 }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
};
