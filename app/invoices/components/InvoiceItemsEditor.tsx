"use client";

import DeleteIcon from "@mui/icons-material/Delete";
import AddIcon from "@mui/icons-material/Add";
import { Box, Button, IconButton, TextField, Typography } from "@mui/material";
import type { InvoiceCreateFormState, InvoiceItemForm } from "../types";
import { formatMoney } from "../utils";

export const InvoiceItemsEditor = ({
  form,
  onItemChange,
  onAddItem,
  onRemoveItem,
}: {
  form: InvoiceCreateFormState;
  onItemChange: (
    index: number,
    field: keyof InvoiceItemForm,
    value: string,
  ) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
}) => {
  return (
    <>
      <Typography
        variant="subtitle1"
        sx={{ mb: 1, fontWeight: 600, color: "#020617" }}
      >
        Позиції інвойсу
      </Typography>

      <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
        {form.items.map((item, index) => (
          <Box
            key={index}
            sx={{
              borderRadius: 2,
              border: "1px solid rgba(148, 163, 184, 0.4)",
              p: 2,
              display: "grid",
              gridTemplateColumns: { xs: "1fr", md: "2fr 1fr 1fr 1fr auto" },
              gap: 1.5,
              alignItems: "flex-start",
              bgcolor: "#f9fafb",
            }}
          >
            <TextField
              label="Назва"
              fullWidth
              InputLabelProps={{ shrink: true }}
              value={item.name}
              onChange={(e) => onItemChange(index, "name", e.target.value)}
            />
            <TextField
              label="Кількість"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
              InputLabelProps={{ shrink: true }}
              value={item.quantity}
              onChange={(e) => onItemChange(index, "quantity", e.target.value)}
            />
            <TextField
              label="Ціна за одиницю"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
              InputLabelProps={{ shrink: true }}
              value={item.unitPrice}
              onChange={(e) => onItemChange(index, "unitPrice", e.target.value)}
            />
            <TextField
              label="ПДВ, %"
              type="number"
              fullWidth
              inputProps={{ min: 0, step: "0.01" }}
              InputLabelProps={{ shrink: true }}
              value={item.taxRate}
              onChange={(e) => onItemChange(index, "taxRate", e.target.value)}
            />

            <Box
              sx={{
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 1,
              }}
            >
              <IconButton
                size="small"
                onClick={() => onRemoveItem(index)}
                disabled={form.items.length === 1}
              >
                <DeleteIcon fontSize="small" />
              </IconButton>

              <Typography variant="caption" sx={{ color: "text.secondary" }}>
                Лінійна сума:{" "}
                {formatMoney(
                  (Number.parseFloat(item.quantity) || 0) *
                    (Number.parseFloat(item.unitPrice) || 0),
                )}{" "}
                {form.currency}
              </Typography>
            </Box>

            <TextField
              label="Опис"
              fullWidth
              multiline
              minRows={2}
              InputLabelProps={{ shrink: true }}
              sx={{ gridColumn: { xs: "1 / -1", md: "1 / -1" } }}
              value={item.description}
              onChange={(e) =>
                onItemChange(index, "description", e.target.value)
              }
            />
          </Box>
        ))}

        <Box>
          <Button
            startIcon={<AddIcon />}
            variant="outlined"
            size="small"
            onClick={onAddItem}
            sx={{ borderRadius: 999, textTransform: "none" }}
          >
            Додати позицію
          </Button>
        </Box>
      </Box>
    </>
  );
};
