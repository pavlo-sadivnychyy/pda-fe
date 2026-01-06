"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Typography,
  Chip,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DescriptionIcon from "@mui/icons-material/Description";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HistoryIcon from "@mui/icons-material/History";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import { useRouter } from "next/navigation";

import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";

// ---- Types used for profile completion ----

type Organization = {
  id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  country?: string | null;
  city?: string | null;
  timeZone?: string | null;
  defaultLanguage?: string | null;
  defaultCurrency?: string | null;
  businessNiche?: string | null;
  servicesDescription?: string | null;
  targetAudience?: string | null;
  brandStyle?: string | null;
};

type OrganizationMembership = {
  organization: Organization;
};

type OrganizationsForUserResponse = {
  items: OrganizationMembership[];
};

type FormValues = {
  name: string;
  websiteUrl: string;
  industry: string;
  description: string;
  businessNiche: string;
  servicesDescription: string;
  targetAudience: string;
  brandStyle: string;
};

const mapOrgToForm = (org: Organization): FormValues => ({
  name: org.name ?? "",
  websiteUrl: org.websiteUrl ?? "",
  industry: org.industry ?? "",
  description: org.description ?? "",
  businessNiche: org.businessNiche ?? "",
  servicesDescription: org.servicesDescription ?? "",
  targetAudience: org.targetAudience ?? "",
  brandStyle: org.brandStyle ?? "",
});

const calculateProfileCompletion = (form: FormValues | null): number => {
  if (!form) return 0;

  const keys: (keyof FormValues)[] = [
    "name",
    "websiteUrl",
    "industry",
    "description",
    "businessNiche",
    "servicesDescription",
    "targetAudience",
    "brandStyle",
  ];

  const filled = keys.filter((k) => form[k]?.trim()).length;
  return Math.round((filled / keys.length) * 100);
};

export default function Home() {
  const router = useRouter();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData, isLoading: isOrgLoading } = useOrganization(
    currentUserId || undefined,
  );

  let organization: Organization | null = null;
  let form: FormValues | null = null;

  if (orgData) {
    const typed = orgData as OrganizationsForUserResponse;
    organization = typed.items?.[0]?.organization ?? null;
    if (organization) {
      form = mapOrgToForm(organization);
    }
  }

  const profileCompletion = calculateProfileCompletion(form);

  const hasNiche = !!form?.businessNiche?.trim();
  const hasServices = !!form?.servicesDescription?.trim();
  const hasAudience = !!form?.targetAudience?.trim();
  const hasBrandStyle = !!form?.brandStyle?.trim();

  const buttonLabel = (() => {
    if (!organization) return "Створити профіль бізнесу";
    if (profileCompletion < 100) return "Доповнити профіль";
    return "Переглянути профіль";
  })();

  const handleProfileClick = () => {
    // 👇 тут постав потрібний шлях до сторінки профілю організації
    router.push("/organization/profile");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6", // світлий фон як у Clerk
        display: "flex",
        justifyContent: "center",
        alignItems: "flex-start",
        py: 3,
        px: 2,
      }}
    >
      <Box
        sx={{
          width: "100%",
          maxWidth: 1120,
        }}
      >
        {/* Верхній привітальний блок */}
        <Card
          elevation={4}
          sx={{
            borderRadius: 3,
            mb: 3,
            overflow: "hidden",
          }}
        >
          <CardContent
            sx={{
              p: 3,
              pb: 2,
            }}
          >
            <Stack
              direction={{ xs: "column", sm: "row" }}
              justifyContent="space-between"
              alignItems={{ xs: "flex-start", sm: "center" }}
              spacing={2}
            >
              <Box>
                <Typography variant="h6" sx={{ fontWeight: 600, mb: 0.5 }}>
                  Привіт, Павле 👋
                </Typography>
                <Typography variant="body2" sx={{ color: "text.secondary" }}>
                  Чим сьогодні допомогти? Обери одну з популярних дій нижче або
                  відкрий чат з асистентом.
                </Typography>
              </Box>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                width={{ xs: "100%", sm: "auto" }}
              >
                <Button
                  onClick={() => router.push("/chat")}
                  fullWidth
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    bgcolor: "#202124",
                    "&:hover": {
                      bgcolor: "#111827",
                    },
                    borderRadius: 999,
                    px: 3,
                  }}
                >
                  AI-чат
                </Button>
                <Button
                  fullWidth
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: "#dadce0",
                    color: "#374151",
                    bgcolor: "#ffffff",
                    "&:hover": {
                      borderColor: "#c4c6cb",
                      bgcolor: "#fafafa",
                    },
                  }}
                >
                  Створити пост
                </Button>
              </Stack>
            </Stack>
          </CardContent>
          <Box
            sx={{
              height: 6,
              bgcolor: "rgba(250, 204, 21, 0.25)",
              backgroundImage:
                "linear-gradient(135deg, rgba(249,115,22,0.4) 0%, rgba(234,179,8,0.4) 100%)",
            }}
          />
        </Card>

        {/* Основна сітка */}
        <Grid container spacing={3}>
          {/* Ліва колонка */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            {/* Профіль бізнесу */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardHeader
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Профіль вашого бізнесу
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Ці дані використовуються асистентом для більш точних
                    відповідей, текстів та рекомендацій.
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 2 }}>
                <Stack spacing={2}>
                  {isOrgLoading ? (
                    <>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Оновлюємо дані профілю...
                        </Typography>
                      </Stack>
                      <LinearProgress
                        sx={{
                          height: 8,
                          borderRadius: 999,
                          bgcolor: "#e5e7eb",
                          "& .MuiLinearProgress-bar": {
                            borderRadius: 999,
                            bgcolor: "#202124",
                          },
                        }}
                      />
                    </>
                  ) : (
                    <>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Заповнено
                        </Typography>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>
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
                            bgcolor: "#202124",
                          },
                        }}
                      />
                    </>
                  )}

                  <List dense sx={{ mt: 1 }}>
                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {hasNiche ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "#16a34a" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#9ca3af" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Ніша бізнесу"
                        secondary={
                          hasNiche ? undefined : "Чим конкретніше — тим краще"
                        }
                      />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {hasServices ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "#16a34a" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#9ca3af" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Опис послуг"
                        secondary={
                          hasServices
                            ? undefined
                            : "Які послуги/продукти ви пропонуєте"
                        }
                      />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {hasAudience ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "#16a34a" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#9ca3af" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Цільова аудиторія"
                        secondary={
                          hasAudience
                            ? undefined
                            : "Кому саме ви продаєте / для кого контент"
                        }
                      />
                    </ListItem>

                    <ListItem disableGutters>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        {hasBrandStyle ? (
                          <CheckCircleIcon
                            sx={{ fontSize: 18, color: "#16a34a" }}
                          />
                        ) : (
                          <RadioButtonUncheckedIcon
                            sx={{ fontSize: 18, color: "#9ca3af" }}
                          />
                        )}
                      </ListItemIcon>
                      <ListItemText
                        primary="Брендовий стиль та tone of voice"
                        secondary={
                          hasBrandStyle
                            ? undefined
                            : "Як ви хочете звучати в текстах"
                        }
                      />
                    </ListItem>
                  </List>

                  <Button
                    variant="outlined"
                    onClick={handleProfileClick}
                    sx={{
                      alignSelf: "flex-start",
                      textTransform: "none",
                      borderRadius: 999,
                      borderColor: "#dadce0",
                      color: "#374151",
                      bgcolor: "#ffffff",
                      "&:hover": {
                        borderColor: "#c4c6cb",
                        bgcolor: "#fafafa",
                      },
                    }}
                  >
                    {buttonLabel}
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* Остання активність */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
              }}
            >
              <CardHeader
                avatar={<HistoryIcon sx={{ color: "#6b7280" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Ваша остання активність
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Швидкий доступ до останніх дій.
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1 }}>
                <List dense>
                  <ListItem divider>
                    <ListItemText
                      primary="Діалог з асистентом: Ідеї для весняної акції"
                      secondary="5 хвилин тому"
                    />
                  </ListItem>
                  <ListItem divider>
                    <ListItemText
                      primary="Згенерований документ: Комерційна пропозиція для нового клієнта"
                      secondary="Сьогодні, 10:21"
                    />
                  </ListItem>
                  <ListItem>
                    <ListItemText
                      primary="Створений контент-план на тиждень"
                      secondary="Вчора"
                    />
                  </ListItem>
                </List>
                <Button
                  size="small"
                  sx={{
                    mt: 1,
                    textTransform: "none",
                    color: "#374151",
                  }}
                  startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
                >
                  Переглянути всю історію
                </Button>
              </CardContent>
            </Card>
          </Grid>

          {/* Права колонка */}
          <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
            {/* Швидкі сценарії */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardHeader
                avatar={<FlashOnIcon sx={{ color: "#f97316" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Популярні задачі
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 0 }}>
                <Stack spacing={1.2}>
                  {[
                    "Зробити опис товару",
                    "Згенерувати пост для соцмереж",
                    "Підготувати відповідь на скаргу",
                    "Пояснити пункт договору",
                    "Придумати ідеї акцій",
                    "Скласти контент-план на тиждень",
                  ].map((label) => (
                    <Button
                      key={label}
                      variant="outlined"
                      fullWidth
                      size="small"
                      sx={{
                        justifyContent: "flex-start",
                        textTransform: "none",
                        borderColor: "#e5e7eb",
                        color: "#374151",
                        bgcolor: "#ffffff",
                        borderRadius: 2,
                        "&:hover": {
                          borderColor: "#d1d5db",
                          bgcolor: "#f9fafb",
                        },
                      }}
                    >
                      {label}
                    </Button>
                  ))}
                </Stack>
              </CardContent>
            </Card>

            {/* Документи */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardHeader
                avatar={<DescriptionIcon sx={{ color: "#6b7280" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Документи
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Завантажуйте договори, описи, регламенти.
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 1 }}>
                <Button
                  onClick={() => router.push("/knowledge-base")}
                  fullWidth
                  variant="outlined"
                  startIcon={<CloudUploadIcon />}
                  sx={{
                    mb: 1.5,
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: "#dadce0",
                    color: "#374151",
                    bgcolor: "#ffffff",
                    "&:hover": {
                      borderColor: "#c4c6cb",
                      bgcolor: "#fafafa",
                    },
                  }}
                >
                  Завантажити документ
                </Button>

                <Divider sx={{ my: 1.5 }} />

                <Typography
                  variant="body2"
                  sx={{ color: "text.secondary", mb: 0.5 }}
                >
                  Останні документи
                </Typography>
                <Stack spacing={0.5}>
                  <Typography variant="body2">
                    • Договір надання послуг.docx
                  </Typography>
                  <Typography variant="body2">
                    • Політика повернення коштів.pdf
                  </Typography>
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    • Опис пакету “Premium”.txt
                  </Typography>
                </Stack>
              </CardContent>
            </Card>

            {/* План / підписка */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
              }}
            >
              <CardHeader
                avatar={<StarBorderIcon sx={{ color: "#f59e0b" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Ваш план
                  </Typography>
                }
              />
              <CardContent>
                <Stack spacing={1.5}>
                  <Stack direction="row" alignItems="center" spacing={1}>
                    <Typography variant="body2">Поточний план:</Typography>
                    <Chip
                      label="Starter"
                      size="small"
                      sx={{
                        bgcolor: "#eef2ff",
                        color: "#4338ca",
                        fontWeight: 500,
                      }}
                    />
                  </Stack>

                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Залишилось <b>134</b> AI-запити цього місяця.
                  </Typography>

                  <Button
                    fullWidth
                    variant="contained"
                    sx={{
                      textTransform: "none",
                      bgcolor: "#202124",
                      "&:hover": { bgcolor: "#111827" },
                      borderRadius: 999,
                    }}
                  >
                    Оновити план
                  </Button>
                </Stack>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      </Box>
    </Box>
  );
}
