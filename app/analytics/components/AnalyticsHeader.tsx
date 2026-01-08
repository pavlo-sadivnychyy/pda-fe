import { Box, Typography } from "@mui/material";

export const AnalyticsHeader = (props: { periodLabel?: string | null }) => {
  const { periodLabel } = props;

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: { xs: "column", md: "row" },
        justifyContent: "space-between",
        gap: 2,
        mb: 3,
      }}
    >
      <Box>
        <Typography
          variant="h6"
          sx={{ fontWeight: 600, mb: 0.5, color: "#020617" }}
        >
          Фінансовий огляд
        </Typography>
        <Typography variant="body2" sx={{ color: "#6b7280", maxWidth: 560 }}>
          Скільки грошей вже зайшло, скільки ще чекаєш та як зараз розподілений
          дохід.
        </Typography>
      </Box>

      {periodLabel && (
        <Box
          sx={{
            minWidth: 220,
            display: "flex",
            flexDirection: "column",
            alignItems: { xs: "flex-start", md: "flex-end" },
            gap: 0.5,
          }}
        >
          <Typography
            variant="caption"
            sx={{ color: "#6b7280", textTransform: "uppercase" }}
          >
            Період
          </Typography>
          <Typography
            variant="subtitle2"
            sx={{ fontWeight: 500, color: "#020617" }}
          >
            {periodLabel}
          </Typography>
        </Box>
      )}
    </Box>
  );
};
