"use client";

import { Paper, Stack, Typography } from "@mui/material";

type Props = {
  organization: { id: string; name: string; slug?: string | null };
  clerkUser: any; // якщо хочеш — підкажи тип Clerk user, зроблю строго типізовано
};

export function OrgInfoCard({ organization, clerkUser }: Props) {
  const ownerEmail = clerkUser?.emailAddresses?.[0]?.emailAddress;

  return (
    <Paper sx={styles.root}>
      <Stack
        marginTop={0}
        direction={{ xs: "column", md: "row" }}
        justifyContent="space-between"
        gap={2}
      >
        <Stack gap={0.5}>
          <Typography variant="subtitle1" sx={styles.title}>
            {organization.name}
          </Typography>
          <Typography variant="body2" sx={styles.muted}>
            Документи цієї бази знань привʼязані саме до цього бізнес-акаунта.
          </Typography>
        </Stack>

        <Stack alignItems={{ xs: "flex-start", md: "flex-end" }} gap={1}>
          {ownerEmail && (
            <Typography variant="caption" sx={{ color: "#9ca3af" }}>
              Власник: {ownerEmail}
            </Typography>
          )}
        </Stack>
      </Stack>
    </Paper>
  );
}

const styles = {
  root: {
    p: 3,
    borderRadius: 3,
    border: "1px solid #e5e7eb",
    bgcolor: "#ffffff",
  },
  overline: { color: "#9ca3af", letterSpacing: 1 },
  title: { color: "#111827", fontWeight: 600 },
  muted: { color: "#6b7280" },
  slug: { borderColor: "#e5e7eb", color: "#6b7280", fontSize: 11 },
} as const;
