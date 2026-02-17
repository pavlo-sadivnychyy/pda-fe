"use client";

import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  Container,
  Typography,
  Button,
  Stack,
  Chip,
  Paper,
  Grid,
  Divider,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from "@mui/material";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Icons
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import DescriptionIcon from "@mui/icons-material/Description";
import PeopleAltIcon from "@mui/icons-material/PeopleAlt";
import EmailIcon from "@mui/icons-material/Email";
import SecurityIcon from "@mui/icons-material/Security";
import InsightsIcon from "@mui/icons-material/Insights";
import BoltIcon from "@mui/icons-material/Bolt";
import VerifiedIcon from "@mui/icons-material/Verified";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import ReceiptLongIcon from "@mui/icons-material/ReceiptLong";
import TaskAltIcon from "@mui/icons-material/TaskAlt";
import DownloadIcon from "@mui/icons-material/Download";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";

// framer-motion
import { motion, AnimatePresence } from "framer-motion";
import Link from "next/link";

/* ================== DESIGN TOKENS ================== */

const ORANGE = "#febe58";
const DARK = "#111827";
const MUTED = "#64748b";
const BG = "#f3f4f6";
const BORDER = "#e5e7eb";

const glassShadow = "0 24px 60px rgba(15, 23, 42, 0.12)";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const pillSx = {
  bgcolor: "#ffffff",
  border: `1px solid ${BORDER}`,
  color: DARK,
  fontWeight: 900,
};

const softCardSx = {
  borderRadius: 4,
  border: `1px solid ${BORDER}`,
  bgcolor: "#ffffff",
  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
};

/* ================== PRICING (COPY MATCHES REAL FEATURES) ================== */

type PlanId = "FREE" | "BASIC" | "PRO";

type Plan = {
  id: PlanId;
  title: string;
  subtitle: string;
  priceMonthly: string | number;
  currency: string;
  ctaLabel: string;
  highlight?: boolean;
  features: string[];
  limits?: string[];
};

const PLANS: Plan[] = [
  {
    id: "FREE",
    title: "FREE",
    subtitle: "Спробуй процес і наведи базовий порядок",
    priceMonthly: "0",
    currency: "$",
    ctaLabel: "Почати безкоштовно",
    features: [
      "1 організація",
      "До 3 клієнтів",
      "До 3 інвойсів/місяць + PDF",
      "Завантаження до 3 документів",
      "Todo-лист",
      "Історія документів",
      // "AI: до 5 запитів/місяць",
    ],
    limits: [
      "Акти та КП + PDF",
      "Відправка документів на email",
      "Нагадування про оплату інвойсів",
      "Експорт CSV / XLSX",
      "Розширена аналітика",
    ],
  },
  {
    id: "BASIC",
    title: "BASIC",
    subtitle: "Щоденна робота ФОП без рутини",
    priceMonthly: 9.99,
    currency: "$",
    highlight: true,
    ctaLabel: "Обрати BASIC",
    features: [
      "До 20 клієнтів",
      "До 20 інвойсів/місяць + PDF",
      "Акти + PDF",
      "Комерційні пропозиції + PDF",
      "Відправка документів на email",
      "Завантаження до 20 документів",
      "Todo-лист без обмежень",
      "Історія документів",
      // "AI: до 50 запитів/місяць",
    ],
    limits: [
      "Нагадування про оплату інвойсів",
      // "AI без обмежень",
      "Розширена аналітика",
      "Експорт CSV / XLSX",
    ],
  },
  {
    id: "PRO",
    title: "PRO",
    subtitle: "Безліміти + контроль + аналітика",
    priceMonthly: 19.99,
    currency: "$",
    ctaLabel: "Обрати PRO",
    features: [
      "Безліміт клієнтів",
      "Безліміт інвойсів + PDF",
      "Акти + PDF",
      "Комерційні пропозиції + PDF",
      "Відправка документів на email",
      "Ручні нагадування про оплату",
      "Документи без обмежень",
      "Todo-лист без обмежень",
      "Історія документів",
      // "AI без обмежень",
      "Розширена аналітика доходів і клієнтів",
      "Експорт CSV / XLSX",
      "Пріоритетна підтримка",
    ],
  },
];

/* ================== CONTENT ================== */

const featureCards = [
  {
    icon: <ReceiptLongIcon sx={{ color: DARK }} />,
    title: "Інвойси + PDF без нервів",
    desc: "Створюй інвойси швидко, тримай історію й віддавай клієнту акуратний PDF.",
    bullets: [
      "Інвойс → PDF в 1 клік",
      "Історія інвойсів і повторення",
      "Зручно для регулярних оплат",
    ],
    badge: "Must-have",
  },
  {
    icon: <PeopleAltIcon sx={{ color: DARK }} />,
    title: "Клієнти в порядку",
    desc: "Контакти, інвойси та документи по кожному клієнту — все зібрано й не губиться.",
    bullets: [
      "Швидкий пошук по клієнтах",
      "Документи привʼязані до клієнта",
      "Менше хаосу в переписках",
    ],
    badge: "Системність",
  },
  {
    icon: <DescriptionIcon sx={{ color: DARK }} />,
    title: "Акти та КП як у дорослого бізнесу",
    desc: "Готуй акти виконаних робіт і комерційні пропозиції з PDF і нормальною структурою.",
    bullets: [
      "Акти + PDF",
      "Комерційні пропозиції + PDF",
      "Охайно й переконливо",
    ],
    badge: "Продажі",
  },
  {
    icon: <EmailIcon sx={{ color: DARK }} />,
    title: "Відправка документів на email",
    desc: "Надсилай інвойси/акти/КП клієнтам одразу з системи — менше ручної рутини.",
    bullets: [
      "Відправка документів клієнту",
      "Зручно для повторних кейсів",
      "Швидше закриття оплат",
    ],
    badge: "Швидкість",
  },
  {
    icon: <UploadFileIcon sx={{ color: DARK }} />,
    title: "Документи в одному місці",
    desc: "Завантажуй файли й тримай все під рукою: без папок “нові-нові(2)”.",
    bullets: [
      "Завантаження документів",
      "Привʼязка до клієнтів/дій",
      "Історія документів",
    ],
    badge: "Порядок",
  },
  // {
  //   icon: <SmartToyIcon sx={{ color: DARK }} />,
  //   title: "AI-помічник для текстів та рішень",
  //   desc: "Сформулює відповідь клієнту, текст для КП або підкаже тактику — швидко й по-людськи.",
  //   bullets: [
  //     "Відповіді на заперечення/знижки",
  //     "Тексти для КП та листів",
  //     "Підказки “що робити далі”",
  //   ],
  //   badge: "Турбо",
  // },
];

const howItWorks = [
  {
    step: "1",
    title: "Створи організацію",
    desc: "Пара кліків — і робочий простір готовий.",
    icon: <VerifiedIcon sx={{ color: ORANGE }} />,
  },
  {
    step: "2",
    title: "Додай клієнта",
    desc: "Контакти та вся історія по ньому — в одному місці.",
    icon: <PeopleAltIcon sx={{ color: ORANGE }} />,
  },
  {
    step: "3",
    title: "Зроби документ",
    desc: "Інвойс / акт / КП → одразу PDF. Без “намалювати в Word”.",
    icon: <ReceiptLongIcon sx={{ color: ORANGE }} />,
  },
  {
    step: "4",
    title: "Відправ і закрий задачу",
    desc: "Надсилай документ на email, став задачі й тримай контроль.",
    icon: <TaskAltIcon sx={{ color: ORANGE }} />,
  },
];

const outcomes7days = [
  {
    icon: <BoltIcon sx={{ color: ORANGE }} />,
    title: "Документи не розкидані",
    desc: "Інвойси/акти/КП + файли зберігаються системно, з історією.",
  },
  {
    icon: <EmailIcon sx={{ color: ORANGE }} />,
    title: "Менше ручних пересилок",
    desc: "Відправка документів клієнту — не через “знайти PDF → прикріпити → написати лист”.",
  },
  {
    icon: <InsightsIcon sx={{ color: ORANGE }} />,
    title: "Кращий контроль по оплатах",
    desc: "Видно, кому і що виставлено, легко повторити документ і не загубити ланцюжок.",
  },
  {
    icon: <DownloadIcon sx={{ color: ORANGE }} />,
    title: "Експорт та звітність",
    desc: "На PRO — CSV/XLSX для бухобліку чи своїх звітів. Без ручного копіпасту.",
  },
];

const faqs = [
  {
    q: "Чим це краще за таблицю?",
    a: "Тут усе повʼязано: клієнт → документ → PDF → відправка → історія. У таблиці це завжди ручний менеджмент і високий шанс щось загубити або зробити помилку.",
  },
  {
    q: "Чи безпечно завантажувати документи?",
    a: "Документи приватні й доступні лише авторизованим користувачам твоєї організації.",
  },
  {
    q: "Який план обрати?",
    a: "FREE — щоб відчути процес. BASIC — регулярна робота з інвойсами/актами/КП + email-відправка. PRO — безліміти, аналітика та експорт CSV/XLSX.",
  },
];

const liveFeed = [
  "Створено інвойс + PDF",
  "Відправлено документ клієнту на email",
  "Згенеровано комерційну пропозицію + PDF",
  "Сформовано акт виконаних робіт + PDF",
  "AI підготував відповідь клієнту (2 варіанти)",
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function formatPrice(v: string | number) {
  if (typeof v === "string") return v;
  const fixed = Math.round(v * 100) / 100;
  return fixed.toString();
}

function planAccent(planId: PlanId) {
  if (planId === "BASIC") return "rgba(254,190,88,0.18)";
  if (planId === "PRO") return "rgba(17,24,39,0.06)";
  return "#fff";
}

/* ================== COMPONENT ================== */

export default function AisdrStyleLanding() {
  const router = useRouter();

  // subtle parallax pointer glow
  const [mouse, setMouse] = useState({ x: 50, y: 30 });
  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth) * 100;
      const y = (e.clientY / window.innerHeight) * 100;
      setMouse({ x: clamp(x, 0, 100), y: clamp(y, 0, 100) });
    };
    window.addEventListener("mousemove", onMove, { passive: true });
    return () => window.removeEventListener("mousemove", onMove);
  }, []);

  // animated “live activity” ticker
  const [feedIdx, setFeedIdx] = useState(0);
  useEffect(() => {
    const t = setInterval(() => {
      setFeedIdx((p) => (p + 1) % liveFeed.length);
    }, 2200);
    return () => clearInterval(t);
  }, []);

  const heroPills = useMemo(
    () => [
      "Клієнти",
      "Інвойси + PDF",
      "Акти + PDF",
      "КП + PDF",
      "Email-відправка",
      "Todo + історія",
    ],
    [],
  );

  return (
    <Box sx={{ bgcolor: BG, minHeight: "100vh" }}>
      {/* NAV */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          position: "sticky",
          top: 0,
          zIndex: 1000,
          borderBottom: `1px solid ${BORDER}`,
          backdropFilter: "blur(10px)",
        }}
      >
        <Container maxWidth="lg">
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              py: 2,
              px: { xs: 2, sm: 0 },
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Image
                  src="/spravly-icon.png"
                  alt="Spravly"
                  width={32}
                  height={32}
                  priority
                />
              </Box>
              <Typography
                sx={{ fontWeight: 950, color: DARK, letterSpacing: "-0.02em" }}
              >
                Spravly
              </Typography>
            </Stack>

            <Stack direction="row" spacing={1.2} alignItems="center">
              <Button
                onClick={() => router.push("/sign-in")}
                sx={{
                  textTransform: "none",
                  fontWeight: 900,
                  color: DARK,
                  borderRadius: 999,
                  px: 1.8,
                  py: 0.9,
                  "&:hover": { bgcolor: "#f9fafb" },
                }}
              >
                Увійти
              </Button>
              <Button
                variant="contained"
                onClick={() => router.push("/sign-up")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: DARK,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 999,
                  px: 2.8,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#000", boxShadow: "none" },
                }}
              >
                Почати
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>

      {/* HERO */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderBottom: `1px solid ${BORDER}`,
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* pointer glow */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(560px 320px at ${mouse.x}% ${mouse.y}%, rgba(243,107,22,0.16), transparent 60%),
                         radial-gradient(900px 420px at 50% 0%, rgba(17,24,39,0.08), transparent 65%)`,
          }}
        />

        <Container
          maxWidth="lg"
          sx={{ position: "relative", py: { xs: 7, md: 10 } }}
        >
          <Grid
            container
            spacing={{ xs: 4, md: 6 }}
            alignItems="center"
            justifyContent="center"
          >
            {/* Left */}
            <Grid item xs={12} md={7}>
              <Stack spacing={2.2} sx={{ px: { xs: 2, sm: 0 } }}>
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Stack
                    direction="row"
                    spacing={1}
                    flexWrap="wrap"
                    alignItems="center"
                    justifyContent={"center"}
                  >
                    <Chip
                      label="Менше рутини"
                      sx={{ ...pillSx, borderRadius: 999 }}
                    />
                    <Chip
                      label="Більше порядку"
                      sx={{ ...pillSx, borderRadius: 999 }}
                    />
                    <Chip
                      label="PDF + email"
                      sx={{ ...pillSx, borderRadius: 999 }}
                    />
                    {/*<Chip*/}
                    {/*  label="AI як турбо-кнопка"*/}
                    {/*  sx={{*/}
                    {/*    bgcolor: "rgba(254,190,88,0.18)",*/}
                    {/*    border: `1px solid rgba(254,190,88,0.35)`,*/}
                    {/*    color: DARK,*/}
                    {/*    fontWeight: 950,*/}
                    {/*    borderRadius: 999,*/}
                    {/*  }}*/}
                    {/*/>*/}
                  </Stack>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      textAlign: "center",
                      fontWeight: 950,
                      color: DARK,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.05,
                      fontSize: { xs: "2.1rem", sm: "2.7rem", md: "3.6rem" },
                      maxWidth: 760,
                    }}
                  >
                    Інвойси, акти й комерційні — в одному місці.
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.16 }}
                >
                  <Typography
                    sx={{
                      textAlign: "center",
                      color: MUTED,
                      fontSize: { xs: "1.05rem", sm: "1.15rem" },
                      lineHeight: 1.8,
                      maxWidth: 760,
                    }}
                  >
                    Spravly допомагає ФОПу вести клієнтів, створювати
                    інвойси/акти/КП з PDF, відправляти документи на email і
                    тримати порядок у задачах.
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.24 }}
                >
                  <Stack
                    direction={{
                      xs: "column",
                      sm: "row",
                    }}
                    justifyContent={"center"}
                    spacing={1.5}
                  >
                    <Button
                      variant="contained"
                      size="large"
                      onClick={() => router.push("/sign-up")}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        bgcolor: ORANGE,
                        textTransform: "none",
                        fontWeight: 950,
                        borderRadius: 999,
                        px: 4,
                        py: 1.55,
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#fdb17f", boxShadow: "none" },
                      }}
                    >
                      Почати безкоштовно
                    </Button>
                    <Button
                      variant="outlined"
                      size="large"
                      onClick={() => router.push("/sign-in")}
                      sx={{
                        borderColor: BORDER,
                        color: DARK,
                        textTransform: "none",
                        fontWeight: 950,
                        borderRadius: 999,
                        px: 4,
                        py: 1.55,
                        "&:hover": {
                          borderColor: "#cbd5e1",
                          bgcolor: "#fafafa",
                        },
                      }}
                    >
                      У мене вже є акаунт
                    </Button>
                  </Stack>
                </MotionBox>

                <Stack
                  direction="row"
                  spacing={1}
                  flexWrap="wrap"
                  sx={{ pt: 1 }}
                >
                  {heroPills.map((t, i) => (
                    <MotionBox
                      key={t}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.35, delay: 0.32 + i * 0.05 }}
                    >
                      <Chip
                        size="small"
                        icon={<CheckCircleIcon sx={{ color: ORANGE }} />}
                        label={t}
                        sx={{
                          bgcolor: "#ffffff",
                          border: `1px solid ${BORDER}`,
                          color: DARK,
                          fontWeight: 900,
                        }}
                      />
                    </MotionBox>
                  ))}
                </Stack>

                {/* mini trust-ish row */}
                <Stack
                  direction={{ xs: "column", sm: "row" }}
                  spacing={1}
                  sx={{ pt: 0.8, color: MUTED }}
                >
                  <Stack direction="row" spacing={1} alignItems="center">
                    <SecurityIcon sx={{ fontSize: 18, color: MUTED }} />
                    <Typography sx={{ fontSize: 13 }}>
                      Доступ лише для авторизованих користувачів організації
                    </Typography>
                  </Stack>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <CheckCircleIcon sx={{ fontSize: 18, color: MUTED }} />
                    <Typography sx={{ fontSize: 13 }}>
                      Стартуєш за 5–10 хвилин — без “налаштувань на півдня”
                    </Typography>
                  </Stack>
                </Stack>
              </Stack>
            </Grid>

            {/* Right - demo card */}
            <Grid item xs={12} md={5}>
              <Stack alignItems="center" sx={{ px: { xs: 2, sm: 0 } }}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.12 }}
                  sx={{
                    width: "100%",
                    maxWidth: 520,
                    borderRadius: 4,
                    border: `1px solid ${BORDER}`,
                    overflow: "hidden",
                    boxShadow: glassShadow,
                    bgcolor: "#fff",
                  }}
                >
                  <Box
                    sx={{
                      p: 2,
                      borderBottom: `1px solid ${BORDER}`,
                      bgcolor: "#ffffff",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Stack direction="row" spacing={1} alignItems="center">
                      <Box
                        sx={{
                          width: 34,
                          height: 34,
                          borderRadius: 999,
                          bgcolor: "#ffffff",
                          border: `1px solid ${BORDER}`,
                          display: "grid",
                          placeItems: "center",
                        }}
                      >
                        <SmartToyIcon sx={{ color: DARK, fontSize: 18 }} />
                      </Box>
                      <Typography sx={{ fontWeight: 950, color: DARK }}>
                        Демо: як це виглядає
                      </Typography>
                    </Stack>

                    <Chip
                      size="small"
                      label="Live"
                      sx={{
                        bgcolor: "rgba(254,190,88,0.18)",
                        border: `1px solid rgba(254,190,88,0.35)`,
                        color: DARK,
                        fontWeight: 950,
                      }}
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#ffffff" }}>
                    <Stack spacing={1.2}>
                      {/* ✅ FIX: документ/інвойс замість чат-бульбашок */}
                      <Box
                        sx={{
                          border: `1px solid ${BORDER}`,
                          borderRadius: 3,
                          overflow: "hidden",
                          bgcolor: "#fff",
                        }}
                      >
                        {/* top strip */}
                        <Box
                          sx={{
                            px: 1.5,
                            py: 1.1,
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "space-between",
                            borderBottom: `1px solid ${BORDER}`,
                            bgcolor: "#f9fafb",
                          }}
                        >
                          <Stack
                            direction="row"
                            spacing={1}
                            alignItems="center"
                          >
                            <Box
                              sx={{
                                width: 34,
                                height: 34,
                                borderRadius: 2,
                                border: `1px solid ${BORDER}`,
                                bgcolor: "#fff",
                                display: "grid",
                                placeItems: "center",
                              }}
                            >
                              <ReceiptLongIcon
                                sx={{ fontSize: 18, color: DARK }}
                              />
                            </Box>

                            <Box>
                              <Typography
                                sx={{
                                  fontWeight: 950,
                                  color: DARK,
                                  fontSize: 13,
                                  lineHeight: 1.2,
                                }}
                              >
                                Invoice № INV-00124
                              </Typography>
                              <Typography
                                sx={{
                                  color: MUTED,
                                  fontSize: 12,
                                  mt: 0.2,
                                }}
                              >
                                17.02.2026 • До оплати до 24.02.2026
                              </Typography>
                            </Box>
                          </Stack>

                          <Chip
                            size="small"
                            label="PDF готовий"
                            sx={{
                              bgcolor: "rgba(254,190,88,0.18)",
                              border: `1px solid rgba(254,190,88,0.35)`,
                              color: DARK,
                              fontWeight: 950,
                            }}
                          />
                        </Box>

                        {/* body */}
                        <Box sx={{ p: 1.5 }}>
                          {/* parties */}
                          <Grid container spacing={1.5}>
                            <Grid item xs={6}>
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: MUTED,
                                  fontWeight: 900,
                                }}
                              >
                                Від
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12.5,
                                  color: DARK,
                                  fontWeight: 950,
                                  mt: 0.3,
                                }}
                              >
                                Spravly Studio
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: MUTED }}>
                                ЄДРПОУ: 12345678
                              </Typography>
                            </Grid>
                            <Grid item xs={6}>
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: MUTED,
                                  fontWeight: 900,
                                }}
                              >
                                Кому
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 12.5,
                                  color: DARK,
                                  fontWeight: 950,
                                  mt: 0.3,
                                }}
                              >
                                ТОВ “Agro Partner”
                              </Typography>
                              <Typography sx={{ fontSize: 12, color: MUTED }}>
                                procurement@agro-partner.ua
                              </Typography>
                            </Grid>
                          </Grid>

                          <Divider sx={{ my: 1.2 }} />

                          {/* items table */}
                          <Box
                            sx={{
                              border: `1px solid ${BORDER}`,
                              borderRadius: 2,
                              overflow: "hidden",
                            }}
                          >
                            <Box
                              sx={{
                                display: "grid",
                                gridTemplateColumns: "1fr 64px 84px",
                                gap: 1,
                                px: 1,
                                py: 0.85,
                                bgcolor: "#f9fafb",
                                borderBottom: `1px solid ${BORDER}`,
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: MUTED,
                                  fontWeight: 950,
                                }}
                              >
                                Позиція
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: MUTED,
                                  fontWeight: 950,
                                  textAlign: "right",
                                }}
                              >
                                К-сть
                              </Typography>
                              <Typography
                                sx={{
                                  fontSize: 11.5,
                                  color: MUTED,
                                  fontWeight: 950,
                                  textAlign: "right",
                                }}
                              >
                                Сума
                              </Typography>
                            </Box>

                            {[
                              {
                                name: "Розробка лендінгу",
                                qty: "1",
                                sum: "$300",
                              },
                              {
                                name: "PDF-шаблони документів",
                                qty: "1",
                                sum: "$120",
                              },
                            ].map((r, idx) => (
                              <Box
                                key={r.name}
                                sx={{
                                  display: "grid",
                                  gridTemplateColumns: "1fr 64px 84px",
                                  gap: 1,
                                  px: 1,
                                  py: 0.85,
                                  borderBottom:
                                    idx === 1 ? "none" : `1px solid ${BORDER}`,
                                }}
                              >
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: DARK,
                                    fontWeight: 800,
                                  }}
                                >
                                  {r.name}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: MUTED,
                                    textAlign: "right",
                                  }}
                                >
                                  {r.qty}
                                </Typography>
                                <Typography
                                  sx={{
                                    fontSize: 12.5,
                                    color: DARK,
                                    fontWeight: 950,
                                    textAlign: "right",
                                  }}
                                >
                                  {r.sum}
                                </Typography>
                              </Box>
                            ))}
                          </Box>

                          {/* totals */}
                          <Stack
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{ mt: 1.2 }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                            >
                              <VerifiedIcon
                                sx={{ color: ORANGE, fontSize: 18 }}
                              />
                              <Typography sx={{ fontSize: 12.5, color: MUTED }}>
                                Статус:{" "}
                                <Box
                                  component="span"
                                  sx={{ color: DARK, fontWeight: 950 }}
                                >
                                  Draft
                                </Box>
                              </Typography>
                            </Stack>

                            <Typography
                              sx={{
                                fontSize: 14,
                                color: DARK,
                                fontWeight: 950,
                              }}
                            >
                              Total: $420
                            </Typography>
                          </Stack>

                          {/* quick actions */}
                          <Stack
                            direction="row"
                            spacing={1}
                            flexWrap="wrap"
                            justifyContent="center"
                            sx={{ mt: 1.1 }}
                          >
                            <Chip
                              size="small"
                              icon={<DownloadIcon sx={{ fontSize: 16 }} />}
                              label="Завантажити PDF"
                              sx={{
                                ...pillSx,
                                "& .MuiChip-icon": { color: DARK },
                              }}
                            />
                            <Chip
                              size="small"
                              icon={<EmailIcon sx={{ fontSize: 16 }} />}
                              label="Відправити email"
                              sx={{
                                ...pillSx,
                                "& .MuiChip-icon": { color: DARK },
                              }}
                            />
                          </Stack>
                        </Box>
                      </Box>

                      <Divider />

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        {[
                          {
                            label: "Інвойс",
                            icon: <ReceiptLongIcon sx={{ fontSize: 16 }} />,
                          },
                          {
                            label: "Акт",
                            icon: <DescriptionIcon sx={{ fontSize: 16 }} />,
                          },
                          {
                            label: "КП",
                            icon: <DescriptionIcon sx={{ fontSize: 16 }} />,
                          },
                          {
                            label: "Email",
                            icon: <EmailIcon sx={{ fontSize: 16 }} />,
                          },
                        ].map((x) => (
                          <Chip
                            key={x.label}
                            size="small"
                            icon={x.icon}
                            label={x.label}
                            sx={{
                              ...pillSx,
                              "& .MuiChip-icon": { color: DARK },
                            }}
                          />
                        ))}
                      </Stack>

                      <Box
                        sx={{
                          mt: 0.5,
                          p: 1.25,
                          borderRadius: 3,
                          border: `1px solid ${BORDER}`,
                          bgcolor: "#ffffff",
                        }}
                      >
                        <Stack
                          direction="row"
                          spacing={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <VerifiedIcon sx={{ color: ORANGE, fontSize: 18 }} />
                          <Typography
                            sx={{ fontWeight: 950, color: DARK, fontSize: 13 }}
                          >
                            “Живий” потік активності
                          </Typography>
                        </Stack>

                        <AnimatePresence mode="wait">
                          <MotionBox
                            key={feedIdx}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.25 }}
                            sx={{ mt: 0.9 }}
                          >
                            <Stack
                              direction="row"
                              spacing={1}
                              alignItems="center"
                              justifyContent="center"
                            >
                              <CheckCircleIcon
                                sx={{ color: ORANGE, fontSize: 18 }}
                              />
                              <Typography sx={{ color: MUTED, fontSize: 13 }}>
                                {liveFeed[feedIdx]}
                              </Typography>
                            </Stack>
                          </MotionBox>
                        </AnimatePresence>
                      </Box>
                    </Stack>
                  </Box>
                </MotionPaper>

                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.2 }}
                  sx={{
                    width: "100%",
                    maxWidth: 520,
                    mt: 2,
                    p: 2,
                    borderRadius: 4,
                    border: `1px solid ${BORDER}`,
                    bgcolor: "#ffffff",
                    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Stack
                    direction="row"
                    spacing={1.2}
                    alignItems="center"
                    justifyContent="center"
                  >
                    <SecurityIcon sx={{ color: DARK }} />
                    <Typography sx={{ fontWeight: 950, color: DARK }}>
                      Документи приватні • дані захищені
                    </Typography>
                  </Stack>
                  <Typography
                    sx={{
                      color: MUTED,
                      fontSize: 13,
                      lineHeight: 1.6,
                      mt: 0.8,
                      textAlign: "center",
                    }}
                  >
                    Доступ — тільки авторизованим користувачам твоєї
                    організації.
                  </Typography>
                </MotionPaper>
              </Stack>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FEATURES */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack
          spacing={1.2}
          alignItems="center"
          textAlign="center"
          sx={{ px: { xs: 2, sm: 0 } }}
        >
          <Chip label="Можливості" sx={{ ...pillSx, fontWeight: 950 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              color: DARK,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
              maxWidth: 980,
            }}
          >
            Сервіс, який закриває щоденну рутину ФОП
          </Typography>
          <Typography sx={{ color: MUTED, maxWidth: 900, lineHeight: 1.8 }}>
            Не “чергова тулза”. Це місце, де у тебе зібрані клієнти, документи,
            PDF, email-відправка, задачі та історія.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={{ xs: 2.5, md: 3 }}
          sx={{ mt: 3 }}
          justifyContent="center"
        >
          {featureCards.map((f, idx) => (
            <Grid item xs={12} md={6} key={f.title}>
              <MotionPaper
                elevation={0}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.05 }}
                whileHover={{ y: -4 }}
                sx={{ ...softCardSx, height: "100%", p: { xs: 3, md: 4 } }}
              >
                <Stack spacing={1.4} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: 4,
                      border: `1px solid ${BORDER}`,
                      bgcolor: "#ffffff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {f.icon}
                  </Box>

                  <Stack
                    direction="row"
                    spacing={1}
                    alignItems="center"
                    justifyContent="center"
                    flexWrap="wrap"
                  >
                    <Typography
                      sx={{ fontWeight: 950, color: DARK, fontSize: 18 }}
                    >
                      {f.title}
                    </Typography>
                    <Chip
                      size="small"
                      label={f.badge}
                      sx={{ ...pillSx, fontWeight: 950 }}
                    />
                  </Stack>

                  <Typography
                    sx={{ color: MUTED, lineHeight: 1.7, maxWidth: 560 }}
                  >
                    {f.desc}
                  </Typography>

                  <Box
                    component="ul"
                    sx={{ m: 0, pl: 2.3, textAlign: "left", maxWidth: 560 }}
                  >
                    {f.bullets.map((b) => (
                      <Typography
                        key={b}
                        component="li"
                        sx={{
                          color: MUTED,
                          lineHeight: 1.8,
                          fontSize: 15,
                          mb: 0.7,
                        }}
                      >
                        {b}
                      </Typography>
                    ))}
                  </Box>
                </Stack>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>
      </Container>

      {/* HOW IT WORKS */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Stack
            spacing={1.2}
            alignItems="center"
            textAlign="center"
            sx={{ px: { xs: 2, sm: 0 } }}
          >
            <Chip label="Як працює" sx={{ ...pillSx, fontWeight: 950 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 950,
                color: DARK,
                letterSpacing: "-0.03em",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                maxWidth: 900,
              }}
            >
              4 кроки — і у тебе порядок
            </Typography>
            <Typography sx={{ color: MUTED, maxWidth: 820, lineHeight: 1.8 }}>
              Логіка проста: організація → клієнт → документ → PDF/відправка →
              історія + задачі.
            </Typography>
          </Stack>

          <Grid
            container
            spacing={{ xs: 2.5, md: 3 }}
            sx={{ mt: 3 }}
            justifyContent="center"
          >
            {howItWorks.map((s, idx) => (
              <Grid item xs={12} md={3} key={s.step}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  sx={{ ...softCardSx, height: "100%", p: 3 }}
                >
                  <Stack spacing={1.1} alignItems="center" textAlign="center">
                    <Chip
                      label={`Крок ${s.step}`}
                      sx={{
                        bgcolor: "rgba(17,24,39,0.06)",
                        border: `1px solid ${BORDER}`,
                        color: DARK,
                        fontWeight: 950,
                      }}
                    />
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        border: `1px solid ${BORDER}`,
                        bgcolor: "#fff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {s.icon}
                    </Box>
                    <Typography
                      sx={{ fontWeight: 950, color: DARK, fontSize: 16 }}
                    >
                      {s.title}
                    </Typography>
                    <Typography
                      sx={{ color: MUTED, lineHeight: 1.8, fontSize: 14 }}
                    >
                      {s.desc}
                    </Typography>
                  </Stack>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            justifyContent="center"
            alignItems="center"
            sx={{ mt: 4 }}
          >
            <Button
              variant="contained"
              size="large"
              onClick={() => router.push("/sign-up")}
              endIcon={<ArrowForwardIcon />}
              sx={{
                bgcolor: ORANGE,
                textTransform: "none",
                fontWeight: 950,
                borderRadius: 999,
                px: 4,
                py: 1.55,
                boxShadow: "none",
                minWidth: { xs: "100%", sm: 260 },
                "&:hover": { bgcolor: "#fdb17f", boxShadow: "none" },
              }}
            >
              Створити акаунт
            </Button>
            <Tooltip title="Якщо хочеш лише глянути — можна стартувати на FREE">
              <Button
                variant="outlined"
                size="large"
                onClick={() => router.push("/sign-in")}
                sx={{
                  borderColor: BORDER,
                  color: DARK,
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 999,
                  px: 4,
                  py: 1.55,
                  minWidth: { xs: "100%", sm: 260 },
                  "&:hover": { borderColor: "#cbd5e1", bgcolor: "#fafafa" },
                }}
              >
                Увійти
              </Button>
            </Tooltip>
          </Stack>
        </Container>
      </Box>

      {/* VALUE / BENEFITS */}
      <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack
          spacing={1.2}
          alignItems="center"
          textAlign="center"
          sx={{ px: { xs: 2, sm: 0 } }}
        >
          <Chip label="Що зміниться" sx={{ ...pillSx, fontWeight: 950 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              color: DARK,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
              maxWidth: 980,
            }}
          >
            Тиждень зі Spravly — і ти відчуєш різницю
          </Typography>
          <Typography sx={{ color: MUTED, maxWidth: 880, lineHeight: 1.8 }}>
            Не магія й не “ще один сервіс”. Просто зникає хаос: документи в
            одному місці, клієнти з історією, відправка з системи, а тексти не
            з’їдають купу часу.
          </Typography>
        </Stack>

        <Grid
          container
          spacing={{ xs: 2.5, md: 3 }}
          sx={{ mt: 3 }}
          justifyContent="center"
        >
          {outcomes7days.map((b, idx) => (
            <Grid item xs={12} md={3} key={b.title}>
              <MotionPaper
                elevation={0}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                sx={{ ...softCardSx, height: "100%", p: 3 }}
              >
                <Stack spacing={1.2} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 48,
                      height: 48,
                      borderRadius: 4,
                      border: `1px solid ${BORDER}`,
                      bgcolor: "#fff",
                      display: "grid",
                      placeItems: "center",
                    }}
                  >
                    {b.icon}
                  </Box>
                  <Typography
                    sx={{ fontWeight: 950, color: DARK, fontSize: 16 }}
                  >
                    {b.title}
                  </Typography>
                  <Typography
                    sx={{ color: MUTED, lineHeight: 1.8, fontSize: 14 }}
                  >
                    {b.desc}
                  </Typography>
                </Stack>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        {/* micro-story row */}
        <Grid container spacing={3} sx={{ mt: 3 }} justifyContent="center">
          <Grid item xs={12} md={6}>
            <Paper elevation={0} sx={{ ...softCardSx, p: 3 }}>
              <Stack spacing={1}>
                <Stack direction="row" spacing={1} alignItems="center">
                  <BoltIcon sx={{ color: ORANGE }} />
                  <Typography sx={{ fontWeight: 950, color: DARK }}>
                    Мікро-сценарій, який знайомий кожному ФОП
                  </Typography>
                </Stack>
                <Typography sx={{ color: MUTED, lineHeight: 1.8 }}>
                  Було: “знайти шаблон → підставити реквізити → зберегти PDF →
                  написати лист → прикріпити файл → згадати, кому що відправив”.
                  <br />
                  Стало: “клієнт → документ → PDF → відправка → історія”. І це
                  не дрібниця — це щоденна економія часу.
                </Typography>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      </Container>

      {/* PRICING */}
      <Box
        sx={{
          bgcolor: "#ffffff",
          borderTop: `1px solid ${BORDER}`,
          borderBottom: `1px solid ${BORDER}`,
        }}
      >
        <Container maxWidth="lg" sx={{ py: { xs: 6, md: 8 } }}>
          <Stack
            spacing={1.2}
            alignItems="center"
            textAlign="center"
            sx={{ px: { xs: 2, sm: 0 } }}
          >
            <Chip label="Тарифи" sx={{ ...pillSx, fontWeight: 950 }} />
            <Typography
              variant="h2"
              sx={{
                fontWeight: 950,
                color: DARK,
                letterSpacing: "-0.03em",
                fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.8rem" },
                maxWidth: 980,
              }}
            >
              Обери рівень під свої обсяги
            </Typography>
            <Typography sx={{ color: MUTED, maxWidth: 900, lineHeight: 1.8 }}>
              FREE — щоб спробувати. BASIC — коли документи вже щодня. PRO —
              коли хочеш безліміти, аналітику та експорт.
            </Typography>
          </Stack>

          <Grid
            container
            spacing={{ xs: 2.5, md: 3 }}
            sx={{ mt: 3 }}
            justifyContent="center"
          >
            {PLANS.map((p, idx) => (
              <Grid item xs={12} md={4} key={p.id}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  whileHover={{ y: -4 }}
                  sx={{
                    ...softCardSx,
                    height: "100%",
                    p: 3,
                    position: "relative",
                    overflow: "hidden",
                    border: p.highlight
                      ? `2px solid rgba(254,190,88,0.55)`
                      : `1px solid ${BORDER}`,
                  }}
                >
                  {/* subtle top glow */}
                  <Box
                    sx={{
                      position: "absolute",
                      top: -80,
                      left: -80,
                      width: 220,
                      height: 220,
                      borderRadius: "50%",
                      background: `radial-gradient(circle, ${planAccent(p.id)} 0%, transparent 60%)`,
                      pointerEvents: "none",
                    }}
                  />

                  <Stack spacing={1.3} sx={{ position: "relative" }}>
                    <Stack
                      direction="row"
                      spacing={1}
                      alignItems="center"
                      justifyContent="space-between"
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <Box
                          sx={{
                            width: 36,
                            height: 36,
                            borderRadius: 999,
                            border: `1px solid ${BORDER}`,
                            display: "grid",
                            placeItems: "center",
                            bgcolor: "#fff",
                          }}
                        >
                          {p.id === "PRO" ? (
                            <WorkspacePremiumIcon
                              sx={{ color: DARK, fontSize: 18 }}
                            />
                          ) : p.id === "BASIC" ? (
                            <BoltIcon sx={{ color: DARK, fontSize: 18 }} />
                          ) : (
                            <VerifiedIcon sx={{ color: DARK, fontSize: 18 }} />
                          )}
                        </Box>
                        <Typography
                          sx={{ fontWeight: 950, color: DARK, fontSize: 18 }}
                        >
                          {p.title}
                        </Typography>
                      </Stack>

                      {p.highlight ? (
                        <Chip
                          label="Найкращий старт"
                          size="small"
                          sx={{
                            bgcolor: "rgba(254,190,88,0.18)",
                            border: `1px solid rgba(254,190,88,0.35)`,
                            color: DARK,
                            fontWeight: 950,
                          }}
                        />
                      ) : null}
                    </Stack>

                    <Typography sx={{ color: MUTED, lineHeight: 1.7 }}>
                      {p.subtitle}
                    </Typography>

                    <Stack direction="row" spacing={1} alignItems="baseline">
                      <Typography
                        sx={{
                          fontWeight: 950,
                          color: DARK,
                          fontSize: 34,
                          letterSpacing: "-0.03em",
                        }}
                      >
                        {p.currency}
                        {formatPrice(p.priceMonthly)}
                      </Typography>
                      <Typography sx={{ color: MUTED }}>/ місяць</Typography>
                    </Stack>

                    <Button
                      variant={p.highlight ? "contained" : "outlined"}
                      onClick={() => router.push("/sign-up")}
                      endIcon={<ArrowForwardIcon />}
                      sx={{
                        mt: 0.5,
                        textTransform: "none",
                        fontWeight: 950,
                        borderRadius: 999,
                        py: 1.2,
                        bgcolor: p.highlight ? ORANGE : "transparent",
                        color: p.highlight ? DARK : DARK,
                        borderColor: p.highlight ? "transparent" : BORDER,
                        boxShadow: "none",
                        "&:hover": {
                          bgcolor: p.highlight ? "#fdb17f" : "#fafafa",
                          boxShadow: "none",
                          borderColor: p.highlight ? "transparent" : "#cbd5e1",
                        },
                      }}
                    >
                      {p.ctaLabel}
                    </Button>

                    <Divider sx={{ my: 1.2 }} />

                    <Typography
                      sx={{ fontWeight: 950, color: DARK, fontSize: 14 }}
                    >
                      Що входить:
                    </Typography>

                    <List dense sx={{ py: 0 }}>
                      {p.features.map((x) => (
                        <ListItem key={x} sx={{ py: 0.3 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <CheckCircleIcon
                              sx={{ color: ORANGE, fontSize: 18 }}
                            />
                          </ListItemIcon>
                          <ListItemText
                            primary={x}
                            primaryTypographyProps={{
                              sx: {
                                color: MUTED,
                                fontSize: 14,
                                lineHeight: 1.6,
                              },
                            }}
                          />
                        </ListItem>
                      ))}
                    </List>

                    {p.limits?.length ? (
                      <>
                        <Divider sx={{ my: 1.2 }} />
                        <Stack direction="row" spacing={1} alignItems="center">
                          <WarningAmberIcon
                            sx={{ color: MUTED, fontSize: 18 }}
                          />
                          <Typography
                            sx={{ fontWeight: 950, color: DARK, fontSize: 14 }}
                          >
                            Недоступно на цьому плані:
                          </Typography>
                        </Stack>
                        <List dense sx={{ py: 0 }}>
                          {p.limits.map((x) => (
                            <ListItem key={x} sx={{ py: 0.25 }}>
                              <ListItemIcon sx={{ minWidth: 28 }}>
                                <Box
                                  sx={{
                                    width: 7,
                                    height: 7,
                                    borderRadius: 999,
                                    bgcolor: "rgba(100,116,139,0.6)",
                                    ml: 1,
                                  }}
                                />
                              </ListItemIcon>
                              <ListItemText
                                primary={x}
                                primaryTypographyProps={{
                                  sx: {
                                    color: MUTED,
                                    fontSize: 13.5,
                                    lineHeight: 1.6,
                                  },
                                }}
                              />
                            </ListItem>
                          ))}
                        </List>
                      </>
                    ) : null}
                  </Stack>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ ...softCardSx, mt: 3, p: 2.5 }}>
            <Stack
              direction={{ xs: "column", md: "row" }}
              spacing={2}
              alignItems={{ xs: "flex-start", md: "center" }}
              justifyContent="space-between"
            >
              <Stack spacing={0.5}>
                <Typography sx={{ fontWeight: 950, color: DARK }}>
                  Підказка по вибору
                </Typography>
                <Typography sx={{ color: MUTED, lineHeight: 1.7 }}>
                  Якщо ти вже регулярно виставляєш інвойси й відправляєш
                  документи клієнтам — найчастіше заходить BASIC. Якщо хочеш
                  аналітику/експорт і безліміти — PRO.
                </Typography>
              </Stack>
              <Button
                variant="contained"
                onClick={() => router.push("/sign-up")}
                endIcon={<ArrowForwardIcon />}
                sx={{
                  bgcolor: DARK,
                  color: "#fff",
                  textTransform: "none",
                  fontWeight: 950,
                  borderRadius: 999,
                  px: 3,
                  py: 1.2,
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#000", boxShadow: "none" },
                  minWidth: { xs: "100%", md: 240 },
                }}
              >
                Почати зараз
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>

      {/* FAQ */}
      <Container maxWidth="md" sx={{ py: { xs: 6, md: 8 } }}>
        <Stack
          spacing={1.2}
          alignItems="center"
          textAlign="center"
          sx={{ px: { xs: 2, sm: 0 } }}
        >
          <Chip label="FAQ" sx={{ ...pillSx, fontWeight: 950 }} />
          <Typography
            variant="h2"
            sx={{
              fontWeight: 950,
              color: DARK,
              letterSpacing: "-0.03em",
              fontSize: { xs: "1.8rem", sm: "2.2rem", md: "2.6rem" },
              maxWidth: 780,
            }}
          >
            Часті питання
          </Typography>
          <Typography sx={{ color: MUTED, maxWidth: 820, lineHeight: 1.8 }}>
            Коротко й по суті — щоб не шукати відповідь по чатам.
          </Typography>
        </Stack>

        <Box sx={{ mt: 3 }}>
          {faqs.map((f) => (
            <Accordion
              key={f.q}
              disableGutters
              elevation={0}
              sx={{
                mb: 1.2,
                border: `1px solid ${BORDER}`,
                borderRadius: 3,
                overflow: "hidden",
                "&:before": { display: "none" },
                bgcolor: "#ffffff",
              }}
            >
              <AccordionSummary
                expandIcon={<KeyboardArrowDownIcon />}
                sx={{ px: 2 }}
              >
                <Typography sx={{ fontWeight: 950, color: DARK }}>
                  {f.q}
                </Typography>
              </AccordionSummary>
              <AccordionDetails sx={{ px: 2, pb: 2 }}>
                <Typography sx={{ color: MUTED, lineHeight: 1.8 }}>
                  {f.a}
                </Typography>
              </AccordionDetails>
            </Accordion>
          ))}
        </Box>
      </Container>

      {/* CTA */}
      <Box sx={{ bgcolor: "#ffffff", borderTop: `1px solid ${BORDER}` }}>
        <Container maxWidth="lg" sx={{ py: { xs: 7, md: 9 } }}>
          <MotionPaper
            elevation={0}
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.25 }}
            transition={{ duration: 0.5 }}
            sx={{
              borderRadius: 4,
              border: `1px solid ${BORDER}`,
              bgcolor: "#ffffff",
              boxShadow: glassShadow,
              overflow: "hidden",
            }}
          >
            <Box
              sx={{
                p: { xs: 3, md: 5 },
                textAlign: "center",
                background:
                  "radial-gradient(900px 320px at 50% 0%, rgba(243,107,22,0.18), transparent 60%)",
              }}
            >
              <Typography
                variant="h2"
                sx={{
                  fontWeight: 950,
                  color: DARK,
                  letterSpacing: "-0.03em",
                  fontSize: { xs: "1.9rem", sm: "2.2rem", md: "2.8rem" },
                  mb: 1.2,
                }}
              >
                Почни сьогодні — і завтра буде легше
              </Typography>

              <Typography
                sx={{
                  color: MUTED,
                  maxWidth: 920,
                  mx: "auto",
                  lineHeight: 1.8,
                  mb: 2.5,
                }}
              >
                Реєстрація → організація → клієнт → документ → PDF → відправка.
                <br />
                5–10 хвилин — і в тебе вже не “хаос у файлах”, а нормальний
                процес.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
                sx={{ maxWidth: 720, mx: "auto" }}
              >
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => router.push("/sign-up")}
                  endIcon={<ArrowForwardIcon />}
                  sx={{
                    bgcolor: ORANGE,
                    textTransform: "none",
                    fontWeight: 950,
                    borderRadius: 999,
                    px: 4,
                    py: 1.55,
                    boxShadow: "none",
                    minWidth: { xs: "100%", sm: 260 },
                    "&:hover": { bgcolor: "#fdb17f", boxShadow: "none" },
                  }}
                >
                  Створити акаунт
                </Button>
                <Button
                  variant="outlined"
                  size="large"
                  onClick={() => router.push("/sign-in")}
                  sx={{
                    borderColor: BORDER,
                    color: DARK,
                    textTransform: "none",
                    fontWeight: 950,
                    borderRadius: 999,
                    px: 4,
                    py: 1.55,
                    minWidth: { xs: "100%", sm: 260 },
                    "&:hover": { borderColor: "#cbd5e1", bgcolor: "#fafafa" },
                  }}
                >
                  Увійти
                </Button>
              </Stack>

              <Stack
                direction="row"
                spacing={1}
                justifyContent="center"
                flexWrap="wrap"
                sx={{ pt: 2 }}
              >
                {[
                  "PDF в 1 клік",
                  "Email-відправка",
                  "Клієнти з історією",
                  "Документи приватні",
                ].map((t) => (
                  <Chip
                    key={t}
                    icon={<CheckCircleIcon sx={{ color: ORANGE }} />}
                    label={t}
                    sx={{
                      bgcolor: "#ffffff",
                      border: `1px solid ${BORDER}`,
                      color: DARK,
                      fontWeight: 900,
                      "& .MuiChip-icon": { ml: 0.5 },
                    }}
                  />
                ))}
              </Stack>
            </Box>
          </MotionPaper>
        </Container>
      </Box>

      {/* FOOTER */}
      <Box sx={{ bgcolor: DARK, color: "#fff" }}>
        <Container maxWidth="lg" sx={{ py: 6 }}>
          <Stack spacing={2} alignItems="center" textAlign="center">
            <Stack direction="row" spacing={1.2} alignItems="center">
              <Box
                sx={{
                  width: 40,
                  height: 40,
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <Image
                  src="/spravly-icon.png"
                  alt="Spravly"
                  width={32}
                  height={32}
                  priority
                />
              </Box>
              <Typography sx={{ fontWeight: 950 }}>Spravly</Typography>
            </Stack>

            <Typography
              sx={{
                color: "rgba(255,255,255,0.72)",
                maxWidth: 820,
                lineHeight: 1.8,
              }}
            >
              Клієнти, інвойси/акти/КП, PDF та відправка на email — в одному
              місці.
              <br />
              Менше рутини — більше контролю.
            </Typography>

            <Divider
              sx={{ width: "100%", borderColor: "rgba(255,255,255,0.12)" }}
            />

            <Typography sx={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}>
              © 2026 Spravly. Всі права захищені.
            </Typography>
            <Box
              sx={{
                display: "flex",
                gap: "10px",
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <Typography
                component={Link}
                href="/privacy-policy"
                sx={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}
              >
                Політика конфіденційності
              </Typography>
              <Typography
                component={Link}
                href="/refund-policy"
                sx={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}
              >
                Політика повернень
              </Typography>
              <Typography
                component={Link}
                href="/terms-and-conditions"
                sx={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}
              >
                Умови користування
              </Typography>
            </Box>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
