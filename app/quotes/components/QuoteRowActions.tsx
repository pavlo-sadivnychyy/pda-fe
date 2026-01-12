"use client";

import { Stack, Button } from "@mui/material";
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
  const canConvert =
    !hasInvoice && (status === "ACCEPTED" || status === "SENT");

  const canSend = status === "DRAFT";
  const canAccept = status === "SENT";
  const canReject = status === "SENT";
  const canExpire = status === "SENT";

  return (
    <Stack direction="row" spacing={1} alignItems="center" height="100%">
      {canSend && (
        <Button
          size="small"
          variant="outlined"
          disabled={busy}
          onClick={() => onAction("send")}
          sx={{ textTransform: "none", fontSize: 12, borderRadius: 999 }}
        >
          Надіслати
        </Button>
      )}

      {canAccept && (
        <Button
          size="small"
          variant="outlined"
          disabled={busy}
          onClick={() => onAction("accept")}
          sx={{ textTransform: "none", fontSize: 12, borderRadius: 999 }}
        >
          Прийнято
        </Button>
      )}

      {canReject && (
        <Button
          size="small"
          variant="outlined"
          color="error"
          disabled={busy}
          onClick={() => onAction("reject")}
          sx={{ textTransform: "none", fontSize: 12, borderRadius: 999 }}
        >
          Відхилити
        </Button>
      )}

      {canExpire && (
        <Button
          size="small"
          variant="outlined"
          color="warning"
          disabled={busy}
          onClick={() => onAction("expire")}
          sx={{ textTransform: "none", fontSize: 12, borderRadius: 999 }}
        >
          Expire
        </Button>
      )}

      <QuoteConvertButton
        disabled={!canConvert}
        busy={busy}
        onClick={onConvert}
      />
    </Stack>
  );
}
