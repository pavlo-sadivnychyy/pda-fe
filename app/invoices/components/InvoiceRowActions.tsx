"use client";

import { useMemo, useState } from "react";
import {
  Box,
  Button,
  Menu,
  MenuItem,
  ListItemText,
  Divider,
  Tooltip,
} from "@mui/material";

import type { InvoiceAction, InvoiceStatus } from "../types";

export const InvoiceRowActions = ({
  status,
  busy,
  hasClientEmail,
  onAction,
}: {
  status: InvoiceStatus;
  busy: boolean;
  hasClientEmail: boolean; // ✅ NEW
  onAction: (action: InvoiceAction) => void;
}) => {
  const canSendByStatus = status === "DRAFT" || status === "OVERDUE";
  const canMarkPaid = status === "SENT" || status === "OVERDUE";
  const canCancel = status === "DRAFT" || status === "SENT";

  const canSend = canSendByStatus && hasClientEmail;

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const sendMenuOpen = Boolean(anchorEl);

  const openSendMenu = (e: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(e.currentTarget);
  };

  const closeSendMenu = () => setAnchorEl(null);

  const compactBaseSx = useMemo(
    () => ({
      textTransform: "none",
      fontSize: 11,
      borderRadius: 999,
      px: 1.25,
      py: 0.25,
      minHeight: 28,
      lineHeight: 1.1,
      "&.Mui-disabled": { borderColor: "#e5e7eb", color: "#9ca3af" },
    }),
    [],
  );

  const sendDisabledReason = !hasClientEmail
    ? "Неможливо надіслати: у клієнта немає email"
    : !canSendByStatus
      ? "Неможливо надіслати в цьому статусі"
      : "";

  return (
    <Box
      sx={{
        display: "flex",
        gap: 0.75,
        justifyContent: "flex-end",
        alignItems: "center",
        height: "100%",
        width: "100%",
        flexWrap: "nowrap",
      }}
    >
      {/* ✅ One Send button + menu */}
      <Tooltip
        title={!canSend && sendDisabledReason ? sendDisabledReason : ""}
        disableHoverListener={canSend}
      >
        <span>
          <Button
            size="small"
            variant="outlined"
            disabled={!canSend || busy}
            onClick={openSendMenu}
            sx={{
              ...compactBaseSx,
              borderColor: "#111827",
              color: "#111827",
              "&:hover": {
                borderColor: "#020617",
                bgcolor: "rgba(15,23,42,0.04)",
              },
            }}
          >
            Надіслати
          </Button>
        </span>
      </Tooltip>

      <Menu
        anchorEl={anchorEl}
        open={sendMenuOpen}
        onClose={closeSendMenu}
        anchorOrigin={{ vertical: "bottom", horizontal: "right" }}
        transformOrigin={{ vertical: "top", horizontal: "right" }}
        slotProps={{
          paper: {
            sx: {
              borderRadius: 2,
              border: "1px solid #e2e8f0",
              boxShadow:
                "0px 20px 25px -5px rgba(0,0,0,0.08), 0px 10px 10px -5px rgba(0,0,0,0.04)",
              minWidth: 220,
              overflow: "hidden",
            },
          },
        }}
      >
        <MenuItem
          disabled={!canSend || busy}
          onClick={() => {
            closeSendMenu();
            onAction("send-ua");
          }}
        >
          <ListItemText primary="Надіслати UA" />
        </MenuItem>

        <MenuItem
          disabled={!canSend || busy}
          onClick={() => {
            closeSendMenu();
            onAction("send-international");
          }}
        >
          <ListItemText primary="Надіслати INTL" />
        </MenuItem>

        <Divider />

        <MenuItem onClick={closeSendMenu}>
          <ListItemText primary="Закрити" />
        </MenuItem>
      </Menu>

      {/* ✅ Mark paid */}
      <Button
        size="small"
        variant="outlined"
        disabled={!canMarkPaid || busy}
        onClick={() => onAction("mark-paid")}
        sx={{
          ...compactBaseSx,
          borderColor: "#16a34a",
          color: "#166534",
          "&:hover": {
            borderColor: "#15803d",
            bgcolor: "rgba(22,163,74,0.06)",
          },
        }}
      >
        Оплачено
      </Button>

      {/* ✅ Cancel */}
      <Button
        size="small"
        variant="outlined"
        disabled={!canCancel || busy}
        onClick={() => onAction("cancel")}
        sx={{
          ...compactBaseSx,
          borderColor: "#dc2626",
          color: "#b91c1c",
          "&:hover": {
            borderColor: "#b91c1c",
            bgcolor: "rgba(220,38,38,0.06)",
          },
        }}
      >
        Скасувати
      </Button>
    </Box>
  );
};
