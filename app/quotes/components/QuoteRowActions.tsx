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
import SendIcon from "@mui/icons-material/Send";
import CheckIcon from "@mui/icons-material/Check";
import CloseIcon from "@mui/icons-material/Close";
import AccessTimeIcon from "@mui/icons-material/AccessTime";

import type { QuoteAction, QuoteStatus } from "../types";
import { QuoteConvertButton } from "./QuoteConvertButton";

export function QuoteRowActions({
  status,
  busy,
  hasInvoice,
  onAction,
  onConvert,
}: {
  status: QuoteStatus;
  busy: boolean;
  hasInvoice: boolean;
  onAction: (a: QuoteAction) => void;
  onConvert: () => void;
}) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const menuOpen = Boolean(anchorEl);

  const canConvert =
    !hasInvoice && (status === "ACCEPTED" || status === "SENT");

  const canSend = status === "DRAFT";
  const canAccept = status === "SENT";
  const canReject = status === "SENT";
  const canExpire = status === "SENT";

  return (
    <Stack
      direction="row"
      spacing={1}
      alignItems="center"
      height="100%"
      sx={{
        width: "100%",
        minWidth: 0, // 🔑 дозволяє дітям стискатися
        overflow: "hidden", // 🔑 нічого не вилітає з клітинки
      }}
    >
      {canSend ? (
        <Button
          size="small"
          variant="outlined"
          disabled={busy}
          onClick={() => onAction("send")}
          startIcon={<SendIcon sx={{ fontSize: 16 }} />}
          sx={{
            flexShrink: 0, // 🔑 ця кнопка не стискається
            textTransform: "none",
            fontSize: 12,
            borderRadius: 999,
            px: 1.25,
            whiteSpace: "nowrap",
            bgcolor: "#ffffff",
            borderColor: "#e2e8f0",
            color: "#111827",
            "&:hover": { bgcolor: "#f3f4f6", borderColor: "#e2e8f0" },
          }}
        >
          Надіслати
        </Button>
      ) : (
        <Box sx={{ width: 0, flexShrink: 0 }} />
      )}

      {/* 🔑 Convert стає "гумовим": займає доступний простір і обрізає текст */}
      <Tooltip
        title={
          hasInvoice
            ? "Вже сконвертовано в інвойс"
            : canConvert
              ? "Конвертувати в інвойс"
              : "Конвертація доступна після 'Надіслано' або 'Прийнято'"
        }
      >
        <Box
          sx={{
            flex: "1 1 auto", // 🔑 може стискатися і рости
            minWidth: 0, // 🔑 потрібен для text-overflow
            overflow: "hidden",
            // Підтискаємо внутрішню кнопку, навіть якщо QuoteConvertButton не приймає sx
            "& .MuiButton-root": {
              width: "100%",
              minWidth: 0,
              px: 1.25,
              whiteSpace: "nowrap",
              overflow: "hidden",
              textOverflow: "ellipsis",
            },
            "& .MuiButton-startIcon": {
              mr: 0.75,
            },
          }}
        >
          <span style={{ display: "block" }}>
            <QuoteConvertButton
              disabled={!canConvert}
              busy={busy}
              onClick={onConvert}
            />
          </span>
        </Box>
      </Tooltip>

      <IconButton
        size="small"
        onClick={(e) => setAnchorEl(e.currentTarget)}
        disabled={busy}
        sx={{
          flexShrink: 0,
          border: "1px solid #e2e8f0",
          bgcolor: "#fff",
          "&:hover": { bgcolor: "#f3f4f6" },
        }}
      >
        <MoreHorizIcon fontSize="small" />
      </IconButton>

      <Menu
        anchorEl={anchorEl}
        open={menuOpen}
        onClose={() => setAnchorEl(null)}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
      >
        <MenuItem
          disabled={!canAccept || busy}
          onClick={() => {
            setAnchorEl(null);
            onAction("accept");
          }}
          sx={{ gap: 1 }}
        >
          <CheckIcon fontSize="small" />
          <Typography variant="body2">Прийнято</Typography>
        </MenuItem>

        <MenuItem
          disabled={!canReject || busy}
          onClick={() => {
            setAnchorEl(null);
            onAction("reject");
          }}
          sx={{ gap: 1 }}
        >
          <CloseIcon fontSize="small" />
          <Typography variant="body2">Відхилено</Typography>
        </MenuItem>

        <MenuItem
          disabled={!canExpire || busy}
          onClick={() => {
            setAnchorEl(null);
            onAction("expire");
          }}
          sx={{ gap: 1 }}
        >
          <AccessTimeIcon fontSize="small" />
          <Typography variant="body2">Протерміновано</Typography>
        </MenuItem>
      </Menu>
    </Stack>
  );
}
