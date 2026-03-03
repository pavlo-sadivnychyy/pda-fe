"use client";

import { Card, CardContent, Stack, Typography } from "@mui/material";
import * as React from "react";

export function SectionCard(props: {
  title: string;
  subtitle?: string;
  right?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card
      sx={{
        borderRadius: "14px",
        boxShadow: "0 1px 6px rgba(16,24,40,0.10)",
        border: "1px solid rgba(15, 23, 42, 0.06)",
      }}
    >
      <CardContent sx={{ p: 2.5 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="flex-start"
          gap={2}
        >
          <Stack gap={0.5}>
            <Typography fontSize={16} fontWeight={700}>
              {props.title}
            </Typography>
            {props.subtitle ? (
              <Typography fontSize={13} color="text.secondary">
                {props.subtitle}
              </Typography>
            ) : null}
          </Stack>
          {props.right}
        </Stack>

        <Stack mt={2}>{props.children}</Stack>
      </CardContent>
    </Card>
  );
}
