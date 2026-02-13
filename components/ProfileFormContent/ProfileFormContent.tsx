import {
  Box,
  Button,
  CardContent,
  Divider,
  LinearProgress,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { ChangeEvent, FormEvent } from "react";
import { SectionTitle } from "../SectionTitle/SectionTitle";
import { FormValues } from "@/app/organization/page";

type ProfileFormContentProps = {
  form: FormValues;
  onChange: (
    field: keyof FormValues,
  ) => (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  onSubmit: (e: FormEvent<HTMLFormElement>) => void;
  isSaving: boolean;
  isEditExisting: boolean;
  profileCompletion: number;
};

export const ProfileFormContent = ({
  form,
  onChange,
  onSubmit,
  isSaving,
  isEditExisting,
  profileCompletion,
}: ProfileFormContentProps) => {
  return (
    <>
      <CardContent
        sx={{
          paddingRight: 3,
          paddingLeft: 3,
          pb: 3,
          pt: 0,
          flex: 1,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden", // контролюємо скрол всередині
        }}
      >
        {/* Фіксований прогрес */}
        <Box mb={2}>
          <Stack
            direction="row"
            justifyContent="space-between"
            alignItems="center"
            sx={{ mb: 0.5 }}
          >
            <Typography variant="body2" sx={{ color: "#6b7280" }}>
              Заповнено профілю
            </Typography>
            <Typography
              variant="body2"
              sx={{ fontWeight: 600, color: "#111827" }}
            >
              {profileCompletion}%
            </Typography>
          </Stack>
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

        <Divider sx={{ mb: 2 }} />

        {/* Скроляться тільки поля */}
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
          <Box
            component="form"
            id="organization-profile-form"
            onSubmit={onSubmit}
            noValidate
          >
            <Stack spacing={3}>
              {/* Блок: основне */}
              <Box>
                <SectionTitle>Основна інформація</SectionTitle>
                <Stack spacing={2}>
                  <TextField
                    fullWidth
                    variant={"standard"}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    required
                    label="Назва компанії"
                    placeholder="Назва компанії"
                    value={form.name}
                    onChange={onChange("name")}
                  />
                  <TextField
                    fullWidth
                    variant={"standard"}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    label="Сайт"
                    placeholder="https://..."
                    value={form.websiteUrl}
                    onChange={onChange("websiteUrl")}
                  />
                  <TextField
                    fullWidth
                    variant={"standard"}
                    InputLabelProps={{ shrink: true }}
                    size="small"
                    label="Індустрія"
                    placeholder="Маркетинг, консалтинг, e-commerce..."
                    value={form.industry}
                    onChange={onChange("industry")}
                  />
                  <TextField
                    variant={"standard"}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    multiline
                    minRows={2}
                    label="Загальний опис бізнесу"
                    placeholder="Коротко опиши, чим займається компанія."
                    value={form.description}
                    onChange={onChange("description")}
                  />
                </Stack>
              </Box>

              {/* Блок: профіль для асистента */}
              <Box>
                <Stack spacing={2}>
                  <TextField
                    variant={"standard"}
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    label="Ніша бізнесу"
                    placeholder="SaaS для малого бізнесу, SMM-агентство, онлайн-школа тощо"
                    value={form.businessNiche}
                    onChange={onChange("businessNiche")}
                  />
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    variant={"standard"}
                    multiline
                    minRows={1}
                    label="Опис послуг"
                    placeholder="Які послуги / продукти ви надаєте? У чому ваша унікальність?"
                    value={form.servicesDescription}
                    onChange={onChange("servicesDescription")}
                  />
                  <TextField
                    fullWidth
                    size="small"
                    InputLabelProps={{ shrink: true }}
                    multiline
                    minRows={1}
                    variant={"standard"}
                    label="Цільова аудиторія"
                    placeholder="Хто ваші клієнти? Гео, тип бізнесу, розмір, їх ключові болі."
                    value={form.targetAudience}
                    onChange={onChange("targetAudience")}
                  />
                  <TextField
                    InputLabelProps={{ shrink: true }}
                    fullWidth
                    size="small"
                    multiline
                    minRows={1}
                    variant={"standard"}
                    label="Брендовий стиль"
                    placeholder="Тон комунікації, стиль контенту, на які бренди ви рівняєтесь."
                    value={form.brandStyle}
                    onChange={onChange("brandStyle")}
                  />
                </Stack>
              </Box>
            </Stack>
          </Box>
        </Box>
      </CardContent>

      {/* Футер з кнопкою збереження */}
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
          type="submit"
          form="organization-profile-form"
          disabled={isSaving}
          fullWidth
          variant="contained"
          sx={{
            textTransform: "none",
            borderRadius: 999,
            py: 1.25,
            bgcolor: "#111827",
            boxShadow: "none",
            color: "white",
            "&:hover": {
              bgcolor: "#000000",
              boxShadow: "none",
            },
          }}
        >
          {isSaving
            ? "Збереження..."
            : isEditExisting
              ? "Зберегти зміни"
              : "Створити профіль"}
        </Button>

        <Typography variant="caption" sx={{ color: "#9ca3af" }}>
          Профіль організації зберігається у вашому акаунті
        </Typography>
      </Box>
    </>
  );
};
