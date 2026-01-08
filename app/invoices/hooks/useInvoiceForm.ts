"use client";

import { useMemo, useState } from "react";
import type {
  InvoiceCreateFormState,
  InvoiceItemForm,
  InvoiceStatus,
} from "../types";
import { defaultItem } from "../types";

const today = () => new Date().toISOString().slice(0, 10);

export const useInvoiceForm = () => {
  const [formStatus, setFormStatus] = useState<InvoiceStatus>("DRAFT");
  const [invoiceForm, setInvoiceForm] = useState<InvoiceCreateFormState>({
    clientId: "",
    issueDate: today(),
    dueDate: "",
    currency: "UAH",
    notes: "",
    items: [defaultItem],
  });

  const reset = () => {
    setInvoiceForm({
      clientId: "",
      issueDate: today(),
      dueDate: "",
      currency: "UAH",
      notes: "",
      items: [defaultItem],
    });
    setFormStatus("DRAFT");
  };

  const setField = (field: keyof InvoiceCreateFormState, value: string) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const setItemField = (
    index: number,
    field: keyof InvoiceItemForm,
    value: string,
  ) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      items[index] = { ...items[index], [field]: value };
      return { ...prev, items };
    });
  };

  const addItem = () => {
    setInvoiceForm((prev) => ({
      ...prev,
      items: [...prev.items, { ...defaultItem }],
    }));
  };

  const removeItem = (index: number) => {
    setInvoiceForm((prev) => {
      if (prev.items.length === 1) return prev;
      return { ...prev, items: prev.items.filter((_, i) => i !== index) };
    });
  };

  const totals = useMemo(() => {
    let subtotal = 0;
    let taxAmount = 0;

    for (const item of invoiceForm.items) {
      const quantity = Number.parseFloat(item.quantity) || 0;
      const unitPrice = Number.parseFloat(item.unitPrice) || 0;
      const taxRate = Number.parseFloat(item.taxRate) || 0;

      const base = quantity * unitPrice;
      const lineTax = base * (taxRate / 100);

      subtotal += base;
      taxAmount += lineTax;
    }

    return { subtotal, taxAmount, total: subtotal + taxAmount };
  }, [invoiceForm.items]);

  return {
    invoiceForm,
    formStatus,
    setFormStatus,
    setField,
    setItemField,
    addItem,
    removeItem,
    totals,
    reset,
  };
};
