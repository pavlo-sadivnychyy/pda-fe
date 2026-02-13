"use client";

import { CardHeader, Chip, Stack, Typography } from "@mui/material";

export function KnowledgeBaseHeader() {
  return (
    <CardHeader
      sx={{ px: { xs: 3, md: 4 }, pt: { xs: 3, md: 4 }, pb: 1 }}
      title={
        <Stack spacing={1}>
          <Chip label="Knowledge base" size="small" sx={styles.pill} />
          <Typography variant="h6" sx={{ fontWeight: 600, color: "#111827" }}>
            Документи
          </Typography>
          <Typography variant="body2" sx={{ color: "#6b7280" }}>
            Додавай договори, політики, FAQ та інші матеріали — та завжди майте
            доступ до них з будь якого пристрою.
          </Typography>
        </Stack>
      }
    />
  );
}

const styles = {
  pill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    bgcolor: "#f3f4f6",
    color: "#6b7280",
    fontWeight: 500,
    fontSize: 11,
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
} as const;
