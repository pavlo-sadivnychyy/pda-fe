"use client";

import { useCallback, useMemo, useState } from "react";
import type { Invoice } from "../types";

export const useActForm = () => {
  const [selectedInvoiceId, setSelectedInvoiceId] = useState("");
  const [actTitle, setActTitle] = useState("");
  const [actNumber, setActNumber] = useState("");
  const [periodFrom, setPeriodFrom] = useState("");
  const [periodTo, setPeriodTo] = useState("");
  const [notes, setNotes] = useState("");

  const reset = useCallback(() => {
    setSelectedInvoiceId("");
    setActTitle("");
    setActNumber("");
    setPeriodFrom("");
    setPeriodTo("");
    setNotes("");
  }, []);

  const selectInvoice = useCallback(
    (invoiceId: string, invoices: Invoice[]) => {
      setSelectedInvoiceId(invoiceId);
      const invoice = invoices.find((i) => i.id === invoiceId);
      if (!invoice) return;

      // автозаповнення тільки якщо поле порожнє
      setActNumber((prev) => (prev.trim() ? prev : `ACT-${invoice.number}`));
      setActTitle((prev) =>
        prev.trim() ? prev : `Акт за інвойсом №${invoice.number}`,
      );
    },
    [],
  );

  const isValid = useMemo(() => {
    return Boolean(selectedInvoiceId) && Boolean(actNumber.trim());
  }, [selectedInvoiceId, actNumber]);

  return {
    fields: {
      selectedInvoiceId,
      actTitle,
      actNumber,
      periodFrom,
      periodTo,
      notes,
    },
    setters: {
      setActTitle,
      setActNumber,
      setPeriodFrom,
      setPeriodTo,
      setNotes,
    },
    reset,
    selectInvoice,
    isValid,
    setSelectedInvoiceId,
  };
};
