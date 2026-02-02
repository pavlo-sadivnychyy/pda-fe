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
 * app/refund-policy/page.tsx
 *
 * This policy is written to match Paddle requirements
 * https://www.paddle.com/legal/invoiced-consumer-terms
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

export default function RefundPolicyPage() {
  const lastUpdated = "02.02.2026";

  /**
   * IMPORTANT:
   * Paddle requires a clear legal business name.
   * If later you register a legal entity / sole trader,
   * replace "Spravly" with the official registered name.
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
                Політика повернення коштів
              </Typography>
              <Typography sx={{ color: ui.textMuted, fontSize: 13, mt: 0.5 }}>
                Останнє оновлення: {lastUpdated}
              </Typography>

              <Divider sx={{ my: 2, borderColor: ui.border }} />

              <P>
                Ця Політика повернення коштів регулює порядок повернення
                платежів за цифрові послуги, що надаються{" "}
                <b>{legalBusinessName}</b>, та відповідає вимогам платіжного
                провайдера Paddle.
              </P>

              <SectionTitle>1. Загальне право на повернення</SectionTitle>
              <P>
                Якщо ви є споживачем (consumer), ви маєте право скасувати
                покупку підписки та отримати{" "}
                <b>повне повернення коштів протягом 14 днів</b> з дати першої
                оплати, без пояснення причин.
              </P>

              <P>
                Це право діє незалежно від того, чи користувалися ви сервісом
                протягом цього періоду.
              </P>

              <SectionTitle>2. Як здійснюється повернення</SectionTitle>
              <P>
                Повернення коштів обробляється через Paddle — офіційного
                платіжного провайдера сервісу {legalBusinessName}.
              </P>

              <P>
                Після підтвердження запиту повернення кошти будуть повернуті тим
                самим способом оплати, який використовувався під час покупки.
                Термін зарахування коштів залежить від банку або платіжної
                установи.
              </P>

              <SectionTitle>3. Після 14-денного періоду</SectionTitle>
              <P>
                Після завершення 14-денного періоду з дати покупки повернення
                коштів не здійснюється, за винятком випадків, передбачених
                обов’язковими нормами застосовного законодавства.
              </P>

              <SectionTitle>4. Скасування підписки</SectionTitle>
              <P>
                Ви можете скасувати підписку у будь-який момент у налаштуваннях
                акаунту. Скасування припиняє майбутні списання, але не впливає
                на вже здійснені платежі, окрім випадків, описаних у розділі 1
                цієї Політики.
              </P>

              <SectionTitle>5. Як подати запит на повернення</SectionTitle>
              <P>
                Щоб скористатися правом на повернення коштів, зверніться до
                служби підтримки за адресою <b>{supportEmail}</b> з email, який
                використовується у вашому акаунті, або скористайтесь
                інструментами підтримки Paddle.
              </P>

              <SectionTitle>6. Контакти</SectionTitle>
              <P>
                Якщо у вас є запитання щодо цієї Політики повернення коштів,
                звертайтесь на <b>{supportEmail}</b>.
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
                    href="/terms-and-conditions"
                    size="small"
                    sx={{
                      textTransform: "none",
                      fontWeight: 800,
                      color: ui.textMuted,
                      "&:hover": { bgcolor: "#f8fafc" },
                    }}
                  >
                    Умови користування
                  </Button>
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
                    Політика конфіденційності
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
