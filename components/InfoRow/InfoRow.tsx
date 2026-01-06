import { Box, Typography } from "@mui/material";

export const InfoRow = ({
  label,
  value,
  multiline = false,
}: {
  label: string;
  value?: string | null;
  multiline?: boolean;
}) => {
  const displayValue = value && value.trim().length > 0 ? value : "Не вказано";

  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography
        variant="caption"
        sx={{
          color: "#9ca3af",
          textTransform: "uppercase",
          letterSpacing: 0.5,
        }}
      >
        {label}
      </Typography>
      <Typography
        variant="body2"
        sx={{
          color: "#111827",
          mt: 0.5,
          whiteSpace: multiline ? "pre-line" : "normal",
        }}
      >
        {displayValue}
      </Typography>
    </Box>
  );
};
