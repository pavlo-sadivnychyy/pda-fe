"use client";

import { Paper, Tab, Tabs } from "@mui/material";

type Props = {
  value: "overview" | "items" | "rules";
  onChange: (value: "overview" | "items" | "rules") => void;
};

export function PlannerMonthTabs({ value, onChange }: Props) {
  return (
    <Paper
      elevation={0}
      sx={{
        borderRadius: 4,
        border: "1px solid",
        borderColor: "divider",
        px: 1.5,
      }}
    >
      <Tabs
        variant="fullWidth"
        value={value}
        onChange={(_, newValue) => onChange(newValue)}
      >
        <Tab value="overview" label="Огляд" />
        <Tab value="items" label="Витрати" />
        <Tab value="rules" label="Регулярні" />
      </Tabs>
    </Paper>
  );
}
