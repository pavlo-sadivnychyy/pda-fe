import { FormValues } from "@/app/organization/profile/page";
import { Organization } from "@/types/organization";
import {
  Box,
  Button,
  CardContent,
  Divider,
  Grid,
  LinearProgress,
  Stack,
  Typography,
} from "@mui/material";
import { SectionTitle } from "../SectionTitle/SectionTitle";
import { InfoRow } from "../InfoRow/InfoRow";

type ProfileViewContentProps = {
  organization: Organization;
  form: FormValues;
  profileCompletion: number;
  onEdit: () => void;
};

export const ProfileViewContent = ({
  organization,
  form,
  profileCompletion,
  onEdit,
}: ProfileViewContentProps) => {
  return (
    <>
      <CardContent
        sx={{
          px: { xs: 3, md: 4 },
          pb: 3,
          pt: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
        }}
      >
        <Box
          sx={{
            flex: 1,
            overflowY: "auto",
            pr: 1,
            pb: 1,
            "&::-webkit-scrollbar": {
              width: 6,
            },
            "&::-webkit-scrollbar-thumb": {
              borderRadius: 999,
              backgroundColor: "#d1d5db",
            },
            "&::-webkit-scrollbar-track": {
              backgroundColor: "transparent",
            },
          }}
        >
          <Stack spacing={3}>
            {/* Верхній блок з назвою та % */}
            <Stack
              direction={{ xs: "column", md: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", md: "center" }}
              spacing={2}
            >
              <Box>
                <Typography
                  variant="h5"
                  sx={{ fontWeight: 600, color: "#111827", mb: 0.5 }}
                >
                  {organization.name}
                </Typography>
                <Typography variant="body2" sx={{ color: "#6b7280" }}>
                  Огляд профілю вашого бізнесу
                </Typography>
              </Box>
              <Stack
                spacing={0.5}
                alignItems={{ xs: "flex-start", md: "flex-end" }}
              >
                <Typography
                  variant="body2"
                  sx={{ color: "#6b7280", fontSize: 12 }}
                >
                  Заповнено профілю
                </Typography>
                <Stack
                  direction="row"
                  spacing={1}
                  alignItems="center"
                  sx={{ minWidth: 180 }}
                >
                  <Box sx={{ flex: 1 }}>
                    <LinearProgress
                      variant="determinate"
                      value={profileCompletion}
                      sx={{
                        height: 8,
                        borderRadius: 999,
                        bgcolor: "#e5e7eb",
                        "& .MuiLinearProgress-bar": {
                          borderRadius: 999,
                          bgcolor: "#111827",
                        },
                      }}
                    />
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{ fontWeight: 600, color: "#111827" }}
                  >
                    {profileCompletion}%
                  </Typography>
                </Stack>
              </Stack>
            </Stack>

            <Divider />

            <Grid container spacing={4}>
              <Grid item xs={12} md={6}>
                <SectionTitle>Основна інформація</SectionTitle>
                <InfoRow label="Назва компанії" value={form.name} />
                <InfoRow label="Сайт" value={form.websiteUrl} />
                <InfoRow label="Індустрія" value={form.industry} />
                <InfoRow
                  label="Загальний опис бізнесу"
                  value={form.description}
                  multiline
                />
              </Grid>

              <Grid item xs={12} md={6}>
                <SectionTitle>Профіль для асистента</SectionTitle>
                <InfoRow label="Ніша бізнесу" value={form.businessNiche} />
                <InfoRow
                  label="Опис послуг"
                  value={form.servicesDescription}
                  multiline
                />
                <InfoRow
                  label="Цільова аудиторія"
                  value={form.targetAudience}
                  multiline
                />
                <InfoRow
                  label="Брендовий стиль"
                  value={form.brandStyle}
                  multiline
                />
              </Grid>
            </Grid>
          </Stack>
        </Box>
      </CardContent>

      {/* Футер з кнопкою редагування */}
      <Box
        sx={{
          px: 3,
          py: 2,
          borderTop: "1px solid #f3f4f6",
          bgcolor: "#faf5ff",
          textAlign: "center",
          flexShrink: 0,
          display: "flex",
          flexDirection: "column",
          gap: 1,
        }}
      >
        <Button
          onClick={onEdit}
          fullWidth
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 999,
            py: 1.25,
            bgcolor: "#111827",
            boxShadow: "none",
            "&:hover": {
              bgcolor: "#000000",
              boxShadow: "none",
            },
          }}
        >
          Редагувати профіль
        </Button>

        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
          Профіль організації зберігається у вашому акаунті
        </Typography>
      </Box>
    </>
  );
};
