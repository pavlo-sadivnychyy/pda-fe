import { CardHeader, Chip, Stack, Typography } from "@mui/material";

export const ProfileHeader = ({ isEditMode }: { isEditMode: boolean }) => (
  <CardHeader
    sx={{
      px: { xs: 3, md: 4 },
      pt: { xs: 3, md: 4 },
      pb: 1,
    }}
    title={
      <Stack spacing={1}>
        <Chip
          label="Business profile"
          size="small"
          sx={{
            alignSelf: "flex-start",
            borderRadius: 999,
            bgcolor: "#f3f4f6",
            color: "#6b7280",
            fontWeight: 500,
            fontSize: 11,
            textTransform: "uppercase",
            letterSpacing: 0.5,
          }}
        />
        <Typography
          variant="h6"
          sx={{
            fontWeight: 600,
            color: "#111827",
          }}
        >
          {isEditMode ? "Профіль вашого бізнесу" : "Створення профілю бізнесу"}
        </Typography>
        <Typography
          variant="body2"
          sx={{
            color: "#6b7280",
            maxWidth: "100%",
          }}
        >
          Заповни ключові дані про компанію — це допоможе асистенту розуміти
          контекст і пропонувати більш точні рішення.
        </Typography>
      </Stack>
    }
  />
);
