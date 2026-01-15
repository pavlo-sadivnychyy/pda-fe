"use client";

import * as React from "react";
import {
  Box,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import PictureAsPdfIcon from "@mui/icons-material/PictureAsPdf";
import SendIcon from "@mui/icons-material/Send";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";

export function ActRowActions({
  act,
  onOpenPdf,
  onSend,
  onDelete,
  busySend,
  busyDelete,
}: {
  act: any;
  onOpenPdf: () => void;
  onSend: () => void | Promise<void>;
  onDelete: () => void;
  busySend?: boolean;
  busyDelete?: boolean;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);

  const clientEmail = act?.client?.email?.trim?.()
    ? String(act.client.email).trim()
    : "";
  const status = String(act?.status ?? "");

  // ✅ правило для кнопки “Надіслати”
  const canSend =
    Boolean(clientEmail) && !["SENT", "SIGNED", "CANCELLED"].includes(status);

  const sendTooltip = !clientEmail
    ? "У клієнта немає email"
    : ["SENT", "SIGNED", "CANCELLED"].includes(status)
      ? `Надсилання недоступне для статусу ${status}`
      : "Надіслати акт клієнту";

  return (
    <Stack direction="row" spacing={1} alignItems="center" height="100%">
      <Button
        size="small"
        variant="outlined"
        onClick={onOpenPdf}
        // startIcon={}
        sx={{
          textTransform: "none",
          fontSize: 12,
          borderRadius: 999,
          px: 1.5,
          py: 0.5,
          minWidth: 0,
          bgcolor: "#111827",
          color: "#f9fafb",
          borderColor: "#111827",
          "&:hover": { bgcolor: "#020617", borderColor: "#020617" },
        }}
      >
        {/*PDF*/}
        <PictureAsPdfIcon sx={{ fontSize: 18 }} />
      </Button>

      <Tooltip title={sendTooltip}>
        <span>
          <Button
            size="small"
            variant="outlined"
            onClick={onSend}
            disabled={!canSend || Boolean(busySend)}
            startIcon={<SendIcon sx={{ fontSize: 18 }} />}
            sx={{
              textTransform: "none",
              fontSize: 12,
              borderRadius: 999,
              px: 1.5,
              py: 0.5,
              minWidth: 0,
              color: "#111827",
              borderColor: "#e2e8f0",
              bgcolor: "#ffffff",
              "&:hover": { bgcolor: "#f3f4f6", borderColor: "#e2e8f0" },
              "&.Mui-disabled": { opacity: 0.6 },
            }}
          >
            Надіслати
          </Button>
        </span>
      </Tooltip>

      <Box>
        <IconButton
          size="small"
          onClick={(e) => setAnchorEl(e.currentTarget)}
          sx={{
            border: "1px solid #e2e8f0",
            bgcolor: "#fff",
            "&:hover": { bgcolor: "#f3f4f6" },
          }}
        >
          <MoreHorizIcon fontSize="small" />
        </IconButton>

        <Menu
          anchorEl={anchorEl}
          open={open}
          onClose={() => setAnchorEl(null)}
          transformOrigin={{ vertical: "top", horizontal: "right" }}
          anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        >
          <MenuItem
            onClick={() => {
              setAnchorEl(null);
              onDelete();
            }}
            disabled={Boolean(busyDelete)}
            sx={{ gap: 1 }}
          >
            <DeleteOutlineIcon fontSize="small" />
            <Typography variant="body2">Видалити</Typography>
          </MenuItem>
        </Menu>
      </Box>
    </Stack>
  );
}
