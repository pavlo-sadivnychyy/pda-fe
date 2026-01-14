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
} from "@mui/material";
import { useRouter } from "next/navigation";

// Icons
import SmartToyIcon from "@mui/icons-material/SmartToy";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import BoltIcon from "@mui/icons-material/Bolt";
import ForumIcon from "@mui/icons-material/Forum";
import DescriptionIcon from "@mui/icons-material/Description";
import AutoAwesomeIcon from "@mui/icons-material/AutoAwesome";
import PlaylistAddCheckIcon from "@mui/icons-material/PlaylistAddCheck";
import VerifiedIcon from "@mui/icons-material/Verified";
import SecurityIcon from "@mui/icons-material/Security";
import Image from "next/image";

// framer-motion
import { motion, AnimatePresence } from "framer-motion";

const ORANGE = "#febe58";
const DARK = "#111827";
const MUTED = "#64748b";
const BG = "#f3f4f6";
const BORDER = "#e5e7eb";

const glassShadow = "0 24px 60px rgba(15, 23, 42, 0.12)";

const MotionBox = motion(Box);
const MotionPaper = motion(Paper);

const navLinkSx = {
  textTransform: "none",
  fontWeight: 900,
  color: DARK,
  borderRadius: 999,
  px: 1.8,
  py: 0.9,
  "&:hover": { bgcolor: "#f9fafb" },
};

const pillSx = {
  bgcolor: "#ffffff",
  border: `1px solid ${BORDER}`,
  color: DARK,
  fontWeight: 900,
};

const featureCards = [
  {
    icon: <ForumIcon sx={{ color: DARK }} />,
    title: "AI-чат як бізнес-помічник",
    desc: "Відповіді клієнтам, продажні тексти, сценарії дій — у твоєму стилі та контексті бізнесу.",
    bullets: [
      "Відповіді на запити та заперечення",
      "Пости/сторіз/комерційні тексти за хвилини",
      "Сценарії: що сказати і що зробити далі",
    ],
    badge: "Найпопулярніше",
  },
  {
    icon: <DescriptionIcon sx={{ color: DARK }} />,
    title: "Документи без болю",
    desc: "Пояснює, перевіряє, допомагає створювати шаблони і приводити тексти до ладу.",
    bullets: [
      "Пояснює договори простими словами",
      "Підсвічує ризики та місця для уточнень",
      "Швидко збирає шаблони під твою нішу",
    ],
    badge: "Для власників",
  },
  {
    icon: <AutoAwesomeIcon sx={{ color: DARK }} />,
    title: "Памʼять бізнесу",
    desc: "Асистент “в темі”: послуги, аудиторія, стиль бренду, контекст — не треба повторювати з нуля.",
    bullets: [
      "Знає твої послуги",
      "Памʼятає історію діалогів",
      "Говорить як твій бренд",
    ],
    badge: "Твоя перевага",
  },
  {
    icon: <PlaylistAddCheckIcon sx={{ color: DARK }} />,
    title: "Шаблони та сценарії",
    desc: "Готові рішення для типових задач: комунікація, контент, FAQ, документи.",
    bullets: [
      "FAQ, відповіді на негатив",
      "Офери й комерційні",
      "Контент-плани під продажі",
    ],
    badge: "Економить час",
  },
];

const faqs = [
  {
    q: "Чи треба вміти писати промпти?",
    a: "Ні. Ти просто формулюєш задачу як людині. Контекст бізнесу та документи підтягуються автоматично.",
  },
  {
    q: "Чи безпечно додавати документи?",
    a: "Так. Документи приватні, доступні тільки авторизованим користувачам твоєї організації.",
  },
  {
    q: "Це заміна юриста?",
    a: "Ні. Асистент допомагає читати/пояснювати/готувати чернетки, але фінальні юридичні рішення — за фахівцем.",
  },
];

const liveFeed = [
  "Згенеровано відповідь клієнту (2 варіанти)",
  "Створено офер для послуги + короткий опис",
  "Пояснено договір: ризики + що уточнити",
  "Складено FAQ для сайту (10 пунктів)",
  "Підготовлено відповідь на негативний відгук",
];

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

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
      "Відповіді клієнтам",
      "Документи",
      "Контент",
      "Сценарії",
      "Історія діалогів",
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
                  bgcolor: "#ffffff",
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
              <Button onClick={() => router.push("/sign-in")} sx={navLinkSx}>
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
        {/* pointer glow + subtle gradients */}
        <Box
          sx={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            background: `radial-gradient(500px 260px at ${mouse.x}% ${mouse.y}%, rgba(243,107,22,0.16), transparent 60%),
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
            sx={{ textAlign: { xs: "center", md: "center" } }}
          >
            {/* Left */}
            <Grid item xs={12} md={12}>
              <Stack
                spacing={2.2}
                alignItems={{ xs: "center", md: "center" }}
                sx={{ px: { xs: 2, sm: 0 } }}
              >
                <MotionBox
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  <Chip
                    label="Менше рутини • Більше продажів • Контекст бізнесу"
                    sx={{
                      ...pillSx,
                      fontWeight: 950,
                      borderRadius: 999,
                    }}
                  />
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.08 }}
                >
                  <Typography
                    variant="h1"
                    sx={{
                      fontWeight: 950,
                      color: DARK,
                      letterSpacing: "-0.03em",
                      lineHeight: 1.05,
                      fontSize: { xs: "2.1rem", sm: "2.7rem", md: "3.6rem" },
                      maxWidth: 760,
                      mx: { xs: "auto", md: 0 },
                    }}
                  >
                    AI-асистент, який знає твій бізнес і робить задачі за тебе
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.16 }}
                >
                  <Typography
                    sx={{
                      color: MUTED,
                      fontSize: { xs: "1.05rem", sm: "1.15rem" },
                      lineHeight: 1.8,
                      maxWidth: 720,
                      mx: { xs: "auto", md: 0 },
                    }}
                  >
                    Відповіді клієнтам, контент, документи та сценарії — в
                    одному місці. Профіль бізнесу + документи = асистент
                    відповідає точно і в твоєму стилі.
                  </Typography>
                </MotionBox>

                <MotionBox
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.55, delay: 0.24 }}
                  sx={{ width: "100%" }}
                >
                  <Stack
                    direction={{ xs: "column", sm: "row" }}
                    spacing={1.5}
                    justifyContent={{ xs: "center", md: "center" }}
                    alignItems="center"
                    sx={{ width: "100%" }}
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
                        minWidth: { xs: "100%", sm: 240 },
                        "&:hover": { bgcolor: "#fdb17f", boxShadow: "none" },
                      }}
                    >
                      Почати без налаштувань
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
                        minWidth: { xs: "100%", sm: 240 },
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
                  justifyContent={{ xs: "center", md: "flex-start" }}
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
                          "& .MuiChip-icon": { ml: 0.5 },
                        }}
                      />
                    </MotionBox>
                  ))}
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
                        Як це виглядає
                      </Typography>
                    </Stack>
                    <Chip
                      size="small"
                      label="Live"
                      sx={{ ...pillSx, fontWeight: 950 }}
                    />
                  </Box>

                  <Box sx={{ p: 2, bgcolor: "#ffffff" }}>
                    <Stack spacing={1.2}>
                      <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                        <Box
                          sx={{
                            maxWidth: "92%",
                            bgcolor: DARK,
                            color: "#f9fafb",
                            borderRadius: 2,
                            px: 1.5,
                            py: 1.2,
                          }}
                        >
                          <Typography
                            sx={{
                              fontWeight: 900,
                              fontSize: 13,
                              lineHeight: 1.5,
                            }}
                          >
                            Клієнт просить знижку. Як відповісти, щоб не
                            просісти по маржі?
                          </Typography>
                        </Box>
                      </Box>

                      <Box
                        sx={{ display: "flex", justifyContent: "flex-start" }}
                      >
                        <Box
                          sx={{
                            maxWidth: "92%",
                            bgcolor: "#f3f4f6",
                            color: DARK,
                            borderRadius: 2,
                            px: 1.5,
                            py: 1.2,
                            border: `1px solid ${BORDER}`,
                          }}
                        >
                          <Typography sx={{ fontWeight: 950, fontSize: 13 }}>
                            Ось 2 варіанти відповіді + тактика:
                          </Typography>
                          <Typography
                            sx={{ mt: 0.8, fontSize: 13, lineHeight: 1.6 }}
                          >
                            1) “Можу дати знижку при пакеті/обʼємі. Так ми
                            збережемо якість і терміни.”
                            <br />
                            2) “Знижка можлива, якщо замінимо X на Y — результат
                            той самий, ціна нижча.”
                          </Typography>
                          <Typography
                            sx={{ mt: 0.8, fontSize: 12, color: MUTED }}
                          >
                            Підкажу, який варіант краще під твою аудиторію.
                          </Typography>
                        </Box>
                      </Box>

                      <Divider />

                      <Stack
                        direction="row"
                        spacing={1}
                        flexWrap="wrap"
                        justifyContent="center"
                      >
                        {["Відповідь", "Офер", "Сценарій", "Документ"].map(
                          (x) => (
                            <Chip key={x} size="small" label={x} sx={pillSx} />
                          ),
                        )}
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
              maxWidth: 900,
            }}
          >
            Сервіс, який закриває щоденну бізнес-рутину
          </Typography>
          <Typography sx={{ color: MUTED, maxWidth: 820, lineHeight: 1.8 }}>
            Не “погрались і забули”. Це робочий інструмент: клієнти, контент,
            документи, сценарії.
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
                transition={{ duration: 0.45, delay: idx * 0.06 }}
                whileHover={{ y: -4 }}
                sx={{
                  height: "100%",
                  p: { xs: 3, md: 4 },
                  borderRadius: 4,
                  border: `1px solid ${BORDER}`,
                  bgcolor: "#ffffff",
                  boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
                }}
              >
                <Stack spacing={1.4} alignItems="center" textAlign="center">
                  <Box
                    sx={{
                      width: 52,
                      height: 52,
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

      {/* VALUE / BENEFITS */}
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
            <Chip label="Чому це вигідно" sx={{ ...pillSx, fontWeight: 950 }} />
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
              Одна підписка, яка економить час і гроші
            </Typography>
            <Typography sx={{ color: MUTED, maxWidth: 820, lineHeight: 1.8 }}>
              Асистент допомагає робити більше без розширення штату та без
              нескінченних “поясни ще раз”.
            </Typography>
          </Stack>

          <Grid
            container
            spacing={{ xs: 2.5, md: 3 }}
            sx={{ mt: 3 }}
            justifyContent="center"
          >
            {[
              {
                icon: <BoltIcon sx={{ color: ORANGE }} />,
                title: "Замість 3 підрядників",
                desc: "Відповіді, контент, документи — без копірайтера, маркетолога і “юриста на годину” на щодень.",
              },
              {
                icon: <VerifiedIcon sx={{ color: ORANGE }} />,
                title: "Не треба вчитись промптам",
                desc: "Працюєш як з людиною: ставиш задачу — отримуєш готовий результат у твоєму стилі.",
              },
              {
                icon: <SecurityIcon sx={{ color: ORANGE }} />,
                title: "Конфіденційно",
                desc: "Документи приватні, доступ лише для твоєї організації.",
              },
            ].map((b, idx) => (
              <Grid item xs={12} md={4} key={b.title}>
                <MotionPaper
                  elevation={0}
                  initial={{ opacity: 0, y: 16 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true, amount: 0.25 }}
                  transition={{ duration: 0.45, delay: idx * 0.06 }}
                  sx={{
                    height: "100%",
                    p: 3,
                    borderRadius: 4,
                    border: `1px solid ${BORDER}`,
                    bgcolor: "#ffffff",
                    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.08)",
                  }}
                >
                  <Stack spacing={1.2} alignItems="center" textAlign="center">
                    <Box
                      sx={{
                        width: 48,
                        height: 48,
                        borderRadius: 4,
                        border: `1px solid ${BORDER}`,
                        bgcolor: "#ffffff",
                        display: "grid",
                        placeItems: "center",
                      }}
                    >
                      {b.icon}
                    </Box>
                    <Typography
                      sx={{ fontWeight: 950, color: DARK, fontSize: 18 }}
                    >
                      {b.title}
                    </Typography>
                    <Typography sx={{ color: MUTED, lineHeight: 1.8 }}>
                      {b.desc}
                    </Typography>
                  </Stack>
                </MotionPaper>
              </Grid>
            ))}
          </Grid>
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
            Відповіді на часті питання
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
                  maxWidth: 900,
                  mx: "auto",
                  lineHeight: 1.8,
                  mb: 2.5,
                }}
              >
                Реєстрація → профіль бізнесу → документи → чат. 5–10 хвилин, і
                асистент працює в твоєму контексті.
              </Typography>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1.5}
                justifyContent="center"
                alignItems="center"
                sx={{ maxWidth: 700, mx: "auto" }}
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
                    minWidth: { xs: "100%", sm: 240 },
                    "&:hover": { bgcolor: "#d95a0f", boxShadow: "none" },
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
                    minWidth: { xs: "100%", sm: 240 },
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
                  "Без промптів",
                  "Контекст бізнесу",
                  "Документи приватні",
                  "Історія діалогів",
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
                maxWidth: 720,
                lineHeight: 1.8,
              }}
            >
              Менше рутини — більше системності. Відповіді клієнтам, контент і
              документи — в одному місці.
            </Typography>

            <Divider
              sx={{ width: "100%", borderColor: "rgba(255,255,255,0.12)" }}
            />

            <Typography sx={{ color: "rgba(255,255,255,0.60)", fontSize: 14 }}>
              © 2026 Spravly. Всі права захищені.
            </Typography>
          </Stack>
        </Container>
      </Box>
    </Box>
  );
}
