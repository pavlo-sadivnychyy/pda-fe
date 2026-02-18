"use client";

import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { Box, Button, Stack, Typography } from "@mui/material";

export function LockedFeatureCallout(props: {
  text?: string;
  onUpgrade?: () => void;
}) {
  return (
    <Box
      sx={{
        borderRadius: "12px",
        border: "1px solid rgba(15, 23, 42, 0.08)",
        boxShadow: "0 1px 6px rgba(16,24,40,0.10)",
        p: 2,
        bgcolor: "background.paper",
      }}
    >
      <Stack direction="row" alignItems="center" gap={1.5}>
        <Box
          sx={{
            width: 36,
            height: 36,
            borderRadius: "10px",
            bgcolor: "rgba(251, 146, 46, 0.15)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <LockOutlinedIcon sx={{ color: "#FB912E" }} />
        </Box>

        <Stack flex={1}>
          <Typography fontWeight={700}>
            Недоступно на поточному плані
          </Typography>
          <Typography fontSize={13} color="text.secondary">
            {props.text ?? "Функція доступна на планах BASIC та PRO."}
          </Typography>
        </Stack>

        <Button
          variant="contained"
          onClick={props.onUpgrade}
          sx={{ borderRadius: "999px", px: 2.5, boxShadow: "none" }}
        >
          Керувати планом
        </Button>
      </Stack>
    </Box>
  );
}
