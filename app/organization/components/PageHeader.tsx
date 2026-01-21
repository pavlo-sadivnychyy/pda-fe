"use client";

import { Box, Button, Chip, Stack, Typography } from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

type Props = {
  mode: "view" | "edit" | "create";
  profileCompletion: number;
  onEdit: () => void;
  onView: () => void;
};

export function PageHeader({ mode, profileCompletion }: Props) {
  const router = useRouter();
  const label =
    mode === "create"
      ? "Створення профілю"
      : mode === "edit"
        ? "Редагування профілю"
        : "Профіль бізнесу";

  return (
    <Box sx={{ mb: 2.5 }}>
      <Button
        onClick={() => router.push("/dashboard")}
        sx={{ color: "black", marginBottom: "20px" }}
        startIcon={<KeyboardReturnIcon fontSize="inherit" />}
      >
        на головну
      </Button>
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "flex-start", sm: "center" }}
      >
        <Stack direction="row" spacing={1} alignItems="center">
          <Box
            sx={{
              width: 38,
              height: 38,
              borderRadius: "999px",
              bgcolor: "#ffffff",
              border: "1px solid #e2e8f0",
              display: "grid",
              placeItems: "center",
            }}
          >
            <BusinessIcon sx={{ color: "#0f172a" }} />
          </Box>

          <Typography variant="h5" sx={{ fontWeight: 800, color: "#0f172a" }}>
            {label}
          </Typography>
        </Stack>

        <Chip
          label={`Заповнено: ${profileCompletion}%`}
          size="small"
          sx={{
            bgcolor: "#ffffff",
            border: "1px solid #e2e8f0",
            color: "#0f172a",
            fontWeight: 700,
          }}
        />
      </Stack>

      <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
        Заповнюй профіль — і асистент відповідатиме точніше, писатиме в
        правильному tone of voice і підказуватиме релевантні ідеї.
      </Typography>
    </Box>
  );
}
