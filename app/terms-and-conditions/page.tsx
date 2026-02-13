"use client";

import * as React from "react";
import Link from "next/link";
import {
  Box,
  Button,
  Card,
  CardContent,
  Container,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import ArrowBackIosNewIcon from "@mui/icons-material/ArrowBackIosNew";

/**
 * File:
 * app/terms-and-conditions/page.tsx
 *
 * Updated to explicitly include the legal business name "Spravly"
 * to satisfy Paddle verification requirements.
 */

const ui = {
  pageBg: "#F6F7FB",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textMuted: "#64748B",
  text: "#0F172A",
  shadow:
    "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
  radius: 5,
};

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: ui.cardBg,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        boxShadow: ui.shadow,
      }}
    >
      {children}
    </Card>
  );
}

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        mt: 3,
        mb: 1,
        fontSize: 16,
        fontWeight: 900,
        color: ui.text,
      }}
    >
      {children}
    </Typography>
  );
}

function P({ children }: { children: React.ReactNode }) {
  return (
    <Typography
      sx={{
        color: ui.textMuted,
        fontSize: 13.5,
        lineHeight: 1.75,
        mb: 1,
      }}
    >
      {children}
    </Typography>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="li"
      sx={{
        color: ui.textMuted,
        fontSize: 13.5,
        lineHeight: 1.75,
        mb: 0.75,
      }}
    >
      {children}
    </Box>
  );
}

export default function TermsAndConditionsPage() {
  const lastUpdated = "02.02.2026";

  /**
   * IMPORTANT FOR PADDLE:
   * This must clearly state the legal business name.
   * Replace with the registered entity name in the future if needed.
   */
  const legalBusinessName = "Spravly";
  const supportEmail = "support@spravly.app";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: ui.pageBg, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Stack spacing={2}>
          <Button
            component={Link}
            href="/"
            startIcon={<ArrowBackIosNewIcon sx={{ fontSize: 14 }} />}
            sx={{
              alignSelf: "flex-start",
              textTransform: "none",
              fontWeight: 900,
              color: ui.text,
              borderRadius: 999,
              px: 1,
            }}
          >
            Назад
          </Button>

          <SoftCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                sx={{ fontSize: 22, fontWeight: 1000, color: ui.text }}
              >
                Умови користування
              </Typography>
              <Typography sx={{ color: ui.textMuted, fontSize: 13, mt: 0.5 }}>
                Останнє оновлення: {lastUpdated}
              </Typography>

              <Divider sx={{ my: 2, borderColor: ui.border }} />

              {/* ✅ LEGAL BUSINESS NAME — REQUIRED BY PADDLE */}
              <P>
                Ці Умови користування є юридично обов’язковою угодою між вами та{" "}
                <b>{legalBusinessName}</b>, що є юридичною назвою бізнесу та
                власником сервісу Spravly (далі — «Компанія», «ми», «наш»).
              </P>

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                sx={{ my: 2 }}
              >
                <Button
                  component={Link}
                  href="/privacy-policy"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: ui.border,
                    color: ui.text,
                    fontWeight: 900,
                    bgcolor: "#fff",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: ui.border,
                    },
                  }}
                >
                  Політика конфіденційності
                </Button>

                <Button
                  component={Link}
                  href="/refund-policy"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: ui.border,
                    color: ui.text,
                    fontWeight: 900,
                    bgcolor: "#fff",
                    "&:hover": {
                      bgcolor: "#f8fafc",
                      borderColor: ui.border,
                    },
                  }}
                >
                  Політика повернення коштів
                </Button>
              </Stack>

              <SectionTitle>1. Визначення</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>
                  <b>Сервіс</b> — програмний продукт Spravly, що належить та
                  управляється компанією {legalBusinessName}.
                </Li>
                <Li>
                  <b>Користувач</b> — будь-яка фізична або юридична особа, яка
                  користується Сервісом.
                </Li>
                <Li>
                  <b>Підписка</b> — платний або безкоштовний тарифний план.
                </Li>
                <Li>
                  <b>Контент</b> — дані, документи, інвойси та файли, створені
                  або завантажені Користувачем.
                </Li>
              </Box>

              <SectionTitle>2. Реєстрація акаунту</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>Ви зобов’язані надавати достовірну інформацію.</Li>
                <Li>Ви відповідаєте за збереження доступу до акаунту.</Li>
                <Li>Усі дії в акаунті вважаються виконаними вами.</Li>
              </Box>

              <SectionTitle>3. Плани та оплата</SectionTitle>
              <P>
                Доступ до деяких функцій надається на умовах платної підписки.
                Оплата обробляється платіжним провайдером Paddle.
              </P>

              {/*<SectionTitle>4. AI-функціонал</SectionTitle>*/}
              {/*<P>*/}
              {/*  AI-інструменти надаються «як є». Компанія не гарантує*/}
              {/*  безпомилковість результатів. Користувач самостійно несе*/}
              {/*  відповідальність за використання результатів.*/}
              {/*</P>*/}

              <SectionTitle>5. Обмеження відповідальності</SectionTitle>
              <P>
                Компанія {legalBusinessName} не несе відповідальності за непрямі
                збитки, втрату прибутку або даних. Загальна відповідальність
                обмежується сумою, сплаченою за останні 12 місяців користування
                Сервісом.
              </P>

              <SectionTitle>6. Контакти</SectionTitle>
              <P>
                Якщо у вас є питання щодо цих Умов, звертайтесь на{" "}
                <b>{supportEmail}</b>.
              </P>

              <Divider sx={{ my: 2.5, borderColor: ui.border }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="space-between"
              >
                <Stack direction="row" spacing={1}>
                  <Button
                    component={Link}
                    href="/privacy-policy"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      color: ui.textMuted,
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    Privacy Policy
                  </Button>
                  <Button
                    component={Link}
                    href="/refund-policy"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      color: ui.textMuted,
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    Refund Policy
                  </Button>
                </Stack>

                <Button
                  component={Link}
                  href="/"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 900,
                    bgcolor: "#0F172A",
                    boxShadow: "none",
                    color: "white",
                    "&:hover": { bgcolor: "#0B1220", boxShadow: "none" },
                  }}
                >
                  На головну
                </Button>
              </Stack>
            </CardContent>
          </SoftCard>
        </Stack>
      </Container>
    </Box>
  );
}
