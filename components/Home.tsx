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
  CircularProgress,
} from "@mui/material";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import RadioButtonUncheckedIcon from "@mui/icons-material/RadioButtonUnchecked";
import DescriptionIcon from "@mui/icons-material/Description";
import FlashOnIcon from "@mui/icons-material/FlashOn";
import HistoryIcon from "@mui/icons-material/History";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import StarBorderIcon from "@mui/icons-material/StarBorder";
import GroupIcon from "@mui/icons-material/Group";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import InsightsIcon from "@mui/icons-material/Insights";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import axios from "axios";
import dayjs from "dayjs";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

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

// ---- Todo types + api ----

type TodoStatus = "PENDING" | "IN_PROGRESS" | "DONE" | "CANCELLED";
type TodoPriority = "LOW" | "MEDIUM" | "HIGH";

type TodoTask = {
  id: string;
  userId: string;
  title: string;
  description?: string | null;
  startAt: string; // ISO
  status: TodoStatus;
  priority: TodoPriority;
};

type TasksResponse = {
  items: TodoTask[];
};

// AI план

type AiPlanTimelineItem = {
  time: string; // "09:00"
  task: string;
  status: TodoStatus;
};

type AiPlan = {
  date: string; // "YYYY-MM-DD"
  summary: string;
  suggestions: string[];
  timeline: AiPlanTimelineItem[];
};

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3000",
});

const formatTime = (iso: string) => dayjs(iso).format("HH:mm");

const priorityLabel = (p: TodoPriority) => {
  switch (p) {
    case "HIGH":
      return "Високий пріоритет";
    case "LOW":
      return "Низький пріоритет";
    default:
      return "Середній пріоритет";
  }
};

const statusLabel = (s: TodoStatus) => {
  switch (s) {
    case "DONE":
      return "Виконано";
    case "IN_PROGRESS":
      return "В процесі";
    case "CANCELLED":
      return "Скасовано";
    default:
      return "Заплановано";
  }
};

export default function Home() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const todayDateString = dayjs().format("YYYY-MM-DD");

  const { data: orgData, isLoading: isOrgLoading } = useOrganization(
    currentUserId || undefined,
  );

  // --- Today tasks for widget ---
  const {
    data: todayTasksResponse,
    isLoading: isTodayTasksLoading,
    isFetching: isTodayTasksFetching,
  } = useQuery<TasksResponse>({
    queryKey: ["todo", "today", currentUserId],
    queryFn: async () => {
      const res = await api.get<TasksResponse>("/todo/tasks/today", {
        params: { userId: currentUserId },
      });
      return res.data;
    },
    enabled: !!currentUserId,
  });

  const todayTasksRaw = todayTasksResponse?.items ?? [];
  const todayTasks = useMemo(
    () =>
      [...todayTasksRaw].sort(
        (a, b) => dayjs(a.startAt).valueOf() - dayjs(b.startAt).valueOf(),
      ),
    [todayTasksRaw],
  );
  const todayCount = todayTasks.length;

  // --- AI plan from backend (persisted) ---
  const [aiError, setAiError] = useState<string | null>(null);

  const {
    data: aiPlan,
    isLoading: isAiPlanLoading,
    isFetching: isAiPlanFetching,
  } = useQuery<AiPlan | null>({
    queryKey: ["aiPlan", currentUserId, todayDateString],
    queryFn: async () => {
      const res = await api.get<{ plan: any | null }>("/todo/tasks/ai-plan", {
        params: {
          userId: currentUserId,
          date: todayDateString,
        },
      });

      const rawPlan = res.data.plan;
      if (!rawPlan) return null;

      const normalized: AiPlan = {
        date: todayDateString,
        summary: rawPlan.summary ?? "AI-план на сьогодні готовий.",
        suggestions: rawPlan.suggestions ?? [],
        timeline: rawPlan.timeline ?? [],
      };

      return normalized;
    },
    enabled: !!currentUserId,
  });

  const generatePlanMutation = useMutation<AiPlan, Error, void>({
    mutationFn: async () => {
      const res = await api.post<{ plan: any }>("/todo/tasks/ai-plan", {
        userId: currentUserId,
        date: todayDateString,
      });

      const rawPlan = res.data.plan || {};
      const normalized: AiPlan = {
        date: todayDateString,
        summary: rawPlan.summary ?? "AI-план на сьогодні готовий.",
        suggestions: rawPlan.suggestions ?? [],
        timeline: rawPlan.timeline ?? [],
      };

      return normalized;
    },
    onSuccess: (normalized) => {
      setAiError(null);
      queryClient.setQueryData<AiPlan | null>(
        ["aiPlan", currentUserId, todayDateString],
        normalized,
      );
    },
    onError: () => {
      setAiError("Не вдалось згенерувати план. Спробуй пізніше.");
    },
  });

  const isAiGenerating = generatePlanMutation.isLoading;

  const handleGeneratePlan = () => {
    if (!currentUserId) return;
    if (aiPlan) return;
    if (!todayCount) return;
    if (isAiGenerating) return;

    generatePlanMutation.mutate();
  };

  // ---- Org / profile ----

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
    router.push("/organization/profile");
  };

  const handleOpenTodo = () => {
    router.push("/todo");
  };

  const handleOpenClients = () => {
    router.push("/clients");
  };

  const handleOpenInvoices = () => {
    router.push("/invoices");
  };

  const handleOpenAnalytics = () => {
    router.push("/analytics");
  };

  const handleOpenActs = () => {
    router.push("/acts");
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
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
                  Привіт, {userData?.firstName} 👋
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

            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardHeader
                avatar={<ReceiptLongIcon sx={{ color: "#6b7280" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Клієнти та фінанси
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Керуйте клієнтами, інвойсами та дивіться фінансову картину.
                  </Typography>
                }
              />
              <CardContent sx={{ pt: 1.5 }}>
                <Stack spacing={1.5}>
                  {/* Клієнти */}
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      p: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "999px",
                        bgcolor: "#eff6ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <GroupIcon sx={{ fontSize: 20, color: "#1d4ed8" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.3 }}
                      >
                        Клієнти
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        Список усіх клієнтів: контакти, компанії, реквізити —
                        все в одному місці.
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleOpenClients}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          borderColor: "#d1d5db",
                          color: "#111827",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            bgcolor: "#f9fafb",
                          },
                        }}
                      >
                        Перейти до клієнтів
                      </Button>
                    </Box>
                  </Box>

                  {/* Інвойси */}
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      p: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "999px",
                        bgcolor: "#fef3c7",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <ReceiptLongIcon
                        sx={{ fontSize: 20, color: "#b45309" }}
                      />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.3 }}
                      >
                        Інвойси
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        Створюй та керуй рахунками: статуси, суми, PDF-версії
                        для відправки та друку.
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleOpenInvoices}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          borderColor: "#d1d5db",
                          color: "#111827",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            bgcolor: "#f9fafb",
                          },
                        }}
                      >
                        Відкрити інвойси
                      </Button>
                    </Box>
                  </Box>
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      p: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "999px",
                        bgcolor: "#ecfeff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <DescriptionIcon
                        sx={{ fontSize: 20, color: "#0e7490" }}
                      />
                    </Box>

                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.3 }}
                      >
                        Акти
                      </Typography>

                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        Створюй акти виконаних робіт, завантажуй PDF, підписуй
                        та передавай клієнтам або в бухгалтерію.
                      </Typography>

                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleOpenActs}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          borderColor: "#d1d5db",
                          color: "#111827",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            bgcolor: "#f9fafb",
                          },
                        }}
                      >
                        Перейти до актів
                      </Button>
                    </Box>
                  </Box>
                  {/* Аналітика */}
                  <Box
                    sx={{
                      borderRadius: 2,
                      border: "1px solid #e5e7eb",
                      p: 1.5,
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 1.5,
                      bgcolor: "#ffffff",
                    }}
                  >
                    <Box
                      sx={{
                        width: 36,
                        height: 36,
                        borderRadius: "999px",
                        bgcolor: "#eef2ff",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        flexShrink: 0,
                      }}
                    >
                      <InsightsIcon sx={{ fontSize: 20, color: "#4f46e5" }} />
                    </Box>
                    <Box sx={{ flex: 1 }}>
                      <Typography
                        variant="subtitle2"
                        sx={{ fontWeight: 600, mb: 0.3 }}
                      >
                        Аналітика
                      </Typography>
                      <Typography
                        variant="body2"
                        sx={{ color: "text.secondary", mb: 1 }}
                      >
                        Фінансовий дашборд: отримано, очікується, прострочено +
                        візуалізація у вигляді кругової діаграми.
                      </Typography>
                      <Button
                        size="small"
                        variant="outlined"
                        onClick={handleOpenAnalytics}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          borderColor: "#d1d5db",
                          color: "#111827",
                          "&:hover": {
                            borderColor: "#9ca3af",
                            bgcolor: "#f9fafb",
                          },
                        }}
                      >
                        Перейти до аналітики
                      </Button>
                    </Box>
                  </Box>
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
            {/* Віджет: задачі на сьогодні */}
            <Card
              elevation={3}
              sx={{
                borderRadius: 3,
                mb: 3,
              }}
            >
              <CardHeader
                avatar={<CheckCircleIcon sx={{ color: "#16a34a" }} />}
                title={
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    Задачі на сьогодні
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Короткий огляд запланованих справ на поточний день.
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1.5 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                    spacing={1}
                  >
                    {isTodayTasksLoading || isTodayTasksFetching ? (
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <CircularProgress size={18} />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Завантажуємо задачі...
                        </Typography>
                      </Stack>
                    ) : (
                      <Typography variant="body2">
                        {todayCount === 0
                          ? "На сьогодні задач ще немає."
                          : `На сьогодні заплановано ${todayCount} задач(і).`}
                      </Typography>
                    )}

                    <Chip
                      label={
                        todayCount > 0 ? `${todayCount} задач(і)` : "0 задач"
                      }
                      size="small"
                      sx={{
                        bgcolor: "#eef2ff",
                        color: "#4338ca",
                        fontWeight: 500,
                      }}
                    />
                  </Stack>

                  <Divider />

                  {todayCount > 0 && (
                    <List dense sx={{ py: 0 }}>
                      {todayTasks.map((task) => {
                        const isPast = dayjs(task.startAt).isBefore(dayjs());
                        const showDoneIcon = task.status === "DONE" || isPast;

                        return (
                          <ListItem
                            key={task.id}
                            disableGutters
                            sx={{ mb: 0.5 }}
                          >
                            <ListItemIcon sx={{ minWidth: 32 }}>
                              {showDoneIcon ? (
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
                              primary={
                                <Stack
                                  direction="row"
                                  alignItems="center"
                                  spacing={1}
                                >
                                  <Typography
                                    variant="body2"
                                    sx={{ fontWeight: 600 }}
                                  >
                                    {formatTime(task.startAt)}
                                  </Typography>
                                  <Typography variant="body2">
                                    {task.title}
                                  </Typography>
                                </Stack>
                              }
                              secondary={
                                <Stack
                                  direction="row"
                                  spacing={1}
                                  sx={{ mt: 0.5 }}
                                >
                                  <Chip
                                    size="small"
                                    label={priorityLabel(task.priority)}
                                    sx={{
                                      height: 20,
                                      fontSize: 10,
                                      bgcolor: "#f3f4f6",
                                    }}
                                  />
                                  <Chip
                                    size="small"
                                    label={statusLabel(task.status)}
                                    sx={{
                                      height: 20,
                                      fontSize: 10,
                                      bgcolor: "#ecfeff",
                                    }}
                                  />
                                </Stack>
                              }
                            />
                          </ListItem>
                        );
                      })}
                    </List>
                  )}

                  {todayCount === 0 &&
                    !isTodayTasksLoading &&
                    !isTodayTasksFetching && (
                      <Typography
                        variant="body2"
                        sx={{
                          color: "text.secondary",
                          fontStyle: "italic",
                        }}
                      >
                        Додай першу задачу в планувальнику, щоб не забути
                        важливі справи.
                      </Typography>
                    )}

                  <Button
                    variant="outlined"
                    fullWidth
                    onClick={handleOpenTodo}
                    sx={{
                      mt: 1,
                      textTransform: "none",
                      borderRadius: 999,
                      borderColor: "#202124",
                      color: "#202124",
                      "&:hover": {
                        borderColor: "#020617",
                        bgcolor: "#f3f4f6",
                      },
                    }}
                  >
                    Відкрити планувальник
                  </Button>
                </Stack>
              </CardContent>
            </Card>

            {/* AI-план дня */}
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
                    AI-план на сьогодні
                  </Typography>
                }
                subheader={
                  <Typography variant="body2" sx={{ color: "text.secondary" }}>
                    Асистент формує структурований план на основі твоїх задач.
                  </Typography>
                }
                sx={{ pb: 0 }}
              />
              <CardContent sx={{ pt: 1.5 }}>
                <Stack spacing={1.5}>
                  <Stack
                    direction="row"
                    alignItems="center"
                    justifyContent="space-between"
                  >
                    <Typography
                      variant="body2"
                      sx={{ color: "text.secondary" }}
                    >
                      План генерується один раз на день і зберігається до
                      завтра.
                    </Typography>

                    <Button
                      size="small"
                      variant="contained"
                      onClick={handleGeneratePlan}
                      disabled={
                        isAiGenerating ||
                        !!aiPlan ||
                        !todayCount ||
                        isAiPlanLoading ||
                        isAiPlanFetching
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        bgcolor: "#202124",
                        "&:hover": { bgcolor: "#111827" },
                        fontSize: 12,
                        px: 2,
                        whiteSpace: "nowrap",
                      }}
                    >
                      {isAiGenerating || isAiPlanLoading || isAiPlanFetching
                        ? "Генеруємо..."
                        : aiPlan
                          ? "План готовий"
                          : todayCount === 0
                            ? "Немає задач"
                            : "Згенерувати план"}
                    </Button>
                  </Stack>

                  {aiError && (
                    <Typography
                      variant="body2"
                      sx={{ color: "#b91c1c", mt: 0.5 }}
                    >
                      {aiError}
                    </Typography>
                  )}

                  {(isAiGenerating || isAiPlanLoading || isAiPlanFetching) &&
                    !aiPlan && (
                      <Stack
                        direction="row"
                        alignItems="center"
                        spacing={1}
                        sx={{ mt: 1 }}
                      >
                        <CircularProgress size={18} />
                        <Typography
                          variant="body2"
                          sx={{ color: "text.secondary" }}
                        >
                          Асистент аналізує задачі та складає план...
                        </Typography>
                      </Stack>
                    )}

                  {aiPlan && !isAiGenerating && (
                    <Stack spacing={1.5} sx={{ mt: 1 }}>
                      {/* Summary */}
                      <Box
                        sx={{
                          bgcolor: "#fefce8",
                          borderRadius: 2,
                          p: 1.5,
                          border: "1px solid #facc15",
                        }}
                      >
                        <Typography
                          variant="subtitle2"
                          sx={{ fontWeight: 600, mb: 0.5 }}
                        >
                          Підсумок дня
                        </Typography>
                        <Typography
                          variant="body2"
                          sx={{ color: "#4b5563", whiteSpace: "pre-line" }}
                        >
                          {aiPlan.summary}
                        </Typography>
                      </Box>

                      {/* Suggestions */}
                      {aiPlan.suggestions && aiPlan.suggestions.length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Рекомендації асистента
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {aiPlan.suggestions.map((s, idx) => (
                              <ListItem
                                key={idx}
                                disableGutters
                                sx={{ py: 0.25 }}
                              >
                                <ListItemText
                                  primary={
                                    <Typography
                                      variant="body2"
                                      sx={{ color: "#4b5563" }}
                                    >
                                      • {s}
                                    </Typography>
                                  }
                                />
                              </ListItem>
                            ))}
                          </List>
                        </Box>
                      )}

                      {/* Timeline */}
                      {aiPlan.timeline && aiPlan.timeline.length > 0 && (
                        <Box>
                          <Typography
                            variant="subtitle2"
                            sx={{ fontWeight: 600, mb: 0.5 }}
                          >
                            Поминутний план
                          </Typography>
                          <List dense sx={{ py: 0 }}>
                            {aiPlan.timeline.map((item, idx) => {
                              const isDone = item.status === "DONE";
                              const statusText = statusLabel(item.status);

                              return (
                                <ListItem
                                  key={idx}
                                  disableGutters
                                  sx={{ mb: 0.25 }}
                                >
                                  <ListItemIcon sx={{ minWidth: 32 }}>
                                    {isDone ? (
                                      <CheckCircleIcon
                                        sx={{
                                          fontSize: 18,
                                          color: "#16a34a",
                                        }}
                                      />
                                    ) : (
                                      <RadioButtonUncheckedIcon
                                        sx={{
                                          fontSize: 18,
                                          color: "#9ca3af",
                                        }}
                                      />
                                    )}
                                  </ListItemIcon>
                                  <ListItemText
                                    primary={
                                      <Stack
                                        direction="row"
                                        alignItems="center"
                                        spacing={1}
                                      >
                                        <Typography
                                          variant="body2"
                                          sx={{ fontWeight: 600 }}
                                        >
                                          {item.time}
                                        </Typography>
                                        <Typography variant="body2">
                                          {item.task}
                                        </Typography>
                                      </Stack>
                                    }
                                    secondary={
                                      <Typography
                                        variant="caption"
                                        sx={{
                                          color: "#6b7280",
                                          mt: 0.25,
                                        }}
                                      >
                                        Статус: {statusText}
                                      </Typography>
                                    }
                                  />
                                </ListItem>
                              );
                            })}
                          </List>
                        </Box>
                      )}
                    </Stack>
                  )}
                </Stack>
              </CardContent>
            </Card>

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
