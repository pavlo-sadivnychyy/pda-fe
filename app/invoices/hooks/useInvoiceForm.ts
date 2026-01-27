"use client";

import { useMemo, useState } from "react";
import type {
  InvoiceCreateFormState,
  InvoiceItemForm,
  InvoiceStatus,
} from "../types";

const defaultItem: InvoiceItemForm = {
  serviceId: null,
  name: "",
  description: "",
  quantity: "1",
  unitPrice: "0",
  taxRate: "",
  addToMyServices: false,
};

const today = () => new Date().toISOString().slice(0, 10);

export type ValidationErrors = {
  items: Array<{
    name?: string;
    quantity?: string;
    unitPrice?: string;
  }>;
};

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

  const [errors, setErrors] = useState<ValidationErrors>({ items: [] });

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
    setErrors({ items: [] });
  };

  const setField = (field: keyof InvoiceCreateFormState, value: string) => {
    setInvoiceForm((prev) => ({ ...prev, [field]: value }));
  };

  const setItemField = (
    index: number,
    field: keyof InvoiceItemForm,
    value: any,
  ) => {
    setInvoiceForm((prev) => {
      const items = [...prev.items];
      const next = { ...items[index] } as InvoiceItemForm;

      if (field === "addToMyServices") {
        next.addToMyServices = Boolean(value);
      } else if (field === "serviceId") {
        next.serviceId = value ? String(value) : null;
      } else {
        let processedValue = String(value ?? "");

        // Валідація і нормалізація для числових полів
        if (field === "quantity") {
          // Дозволяємо тільки цілі числа
          processedValue = processedValue.replace(/[^\d]/g, "");
        } else if (field === "unitPrice" || field === "taxRate") {
          // Дозволяємо числа з крапкою
          processedValue = processedValue
            .replace(/[^\d.]/g, "")
            .replace(/(\..*)\./g, "$1"); // тільки одна крапка
        }

        (next as any)[field] = processedValue;
      }

      items[index] = next;
      return { ...prev, items };
    });

    // Очищаємо помилку для цього поля
    if (field === "name" || field === "quantity" || field === "unitPrice") {
      setErrors((prev) => {
        const newItems = [...prev.items];
        if (newItems[index]) {
          newItems[index] = { ...newItems[index], [field]: undefined };
        }
        return { items: newItems };
      });
    }
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
    setErrors((prev) => ({
      items: prev.items.filter((_, i) => i !== index),
    }));
  };

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = { items: [] };
    let isValid = true;

    invoiceForm.items.forEach((item, index) => {
      const itemErrors: {
        name?: string;
        quantity?: string;
        unitPrice?: string;
      } = {};

      // Валідація назви послуги/товару
      if (!item.name || !item.name.trim()) {
        itemErrors.name = "Обов'язкове поле";
        isValid = false;
      }

      // Валідація кількості
      if (!item.quantity || !item.quantity.trim()) {
        itemErrors.quantity = "Обов'язкове поле";
        isValid = false;
      } else {
        const qty = Number.parseFloat(item.quantity);
        if (isNaN(qty) || qty <= 0) {
          itemErrors.quantity = "Має бути число більше 0";
          isValid = false;
        }
      }

      // Валідація ціни
      if (!item.unitPrice || !item.unitPrice.trim()) {
        itemErrors.unitPrice = "Обов'язкове поле";
        isValid = false;
      } else {
        const price = Number.parseFloat(item.unitPrice);
        if (isNaN(price) || price < 0) {
          itemErrors.unitPrice =
            "Має бути число (використовуйте крапку для дробових)";
          isValid = false;
        }
      }

      newErrors.items[index] = itemErrors;
    });

    setErrors(newErrors);
    return isValid;
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
    errors,
    validateForm,
  };
};
