"use client";

import { Card, CardContent, CardHeader, Typography } from "@mui/material";
import * as React from "react";

export function ActivityCard({
  count,
  children,
}: {
  count: number;
  children: React.ReactNode;
}) {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 700 }}>
            Останні події
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Записи по інвойсам, актам і пропозиціям. Всього: {count}
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>{children}</CardContent>
    </Card>
  );
}
