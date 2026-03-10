"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import EditOutlinedIcon from "@mui/icons-material/EditOutlined";
import {
  Button,
  Chip,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { ExpenseItem } from "../planner.types";
import { formatMoney } from "../helpers";

type Props = {
  items: ExpenseItem[];
  currency: string;
  onEdit: (item: ExpenseItem) => void;
  onDelete: (id: string) => void;
};

export function PlannerItemsTable({
  items,
  currency,
  onEdit,
  onDelete,
}: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        overflow: "hidden",
      }}
    >
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        sx={{ p: 3, pb: 2 }}
      >
        <Typography variant="h6" fontWeight={800}>
          Витрати місяця
        </Typography>
        <Chip label={`${items.length} записів`} />
      </Stack>

      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Назва</TableCell>
            <TableCell>Категорія</TableCell>
            <TableCell>Тип</TableCell>
            <TableCell>Дата</TableCell>
            <TableCell>План</TableCell>
            <TableCell>Факт</TableCell>
            <TableCell align="right">Дії</TableCell>
          </TableRow>
        </TableHead>

        <TableBody>
          {items.map((item) => (
            <TableRow key={item.id} hover>
              <TableCell>
                <Stack spacing={0.5}>
                  <Typography fontWeight={700}>{item.title}</Typography>
                  {item.vendorName ? (
                    <Typography variant="caption" color="text.secondary">
                      {item.vendorName}
                    </Typography>
                  ) : null}
                </Stack>
              </TableCell>

              <TableCell>{item.category?.name ?? "Без категорії"}</TableCell>

              <TableCell>
                <Chip
                  size="small"
                  label={item.type === "PLANNED" ? "Планова" : "Фактична"}
                  color={item.type === "PLANNED" ? "default" : "primary"}
                />
              </TableCell>

              <TableCell>{item.expenseDate.slice(0, 10)}</TableCell>

              <TableCell>
                {formatMoney(item.amountPlanned)} {currency}
              </TableCell>

              <TableCell>
                {formatMoney(item.amountActual)} {currency}
              </TableCell>

              <TableCell align="right">
                <Stack direction="row" spacing={1} justifyContent="flex-end">
                  <Button
                    size="small"
                    startIcon={<EditOutlinedIcon />}
                    onClick={() => onEdit(item)}
                  >
                    Редагувати
                  </Button>

                  <Button
                    size="small"
                    color="error"
                    startIcon={<DeleteOutlineIcon />}
                    onClick={() => onDelete(item.id)}
                  >
                    Видалити
                  </Button>
                </Stack>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}
