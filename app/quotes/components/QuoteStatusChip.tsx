"use client";

import { Chip } from "@mui/material";
import type { QuoteStatus } from "../types";

const map = (s: QuoteStatus) => {
  switch (s) {
    case "DRAFT":
      return { label: "Чернетка", color: "default" as const };
    case "SENT":
      return { label: "Надіслано", color: "info" as const };
    case "ACCEPTED":
      return { label: "Прийнято", color: "success" as const };
    case "REJECTED":
      return { label: "Відхилено", color: "error" as const };
    case "EXPIRED":
      return { label: "Протерміновано", color: "warning" as const };
    case "CONVERTED":
      return { label: "Конвертовано", color: "success" as const };
    default:
      return { label: String(s), color: "default" as const };
  }
};

export function QuoteStatusChip({ status }: { status: QuoteStatus }) {
  const { label, color } = map(status);

  return (
    <Chip
      size="small"
      label={label}
      color={color}
      variant={status === "DRAFT" ? "outlined" : "filled"}
      sx={{ fontWeight: 700 }}
    />
  );
}
