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
 * Файл:
 * app/refund-policy/page.tsx
 */

const ui = {
  pageBg: "#F6F7FB",
  cardBg: "#FFFFFF",
  border: "#E2E8F0",
  textMuted: "#64748B",
  text: "#0F172A",
  shadow:
    "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0px,0px,0px,0.04)",
  radius: 16,
};

function SoftCard({ children }: { children: React.ReactNode }) {
  return (
    <Card
      elevation={0}
      sx={{
        bgcolor: ui.cardBg,
        border: `1px solid ${ui.border}`,
        borderRadius: ui.radius,
        boxShadow:
          "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
        overflow: "hidden",
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
    <Typography sx={{ color: ui.textMuted, fontSize: 13.5, lineHeight: 1.75 }}>
      {children}
    </Typography>
  );
}

function Li({ children }: { children: React.ReactNode }) {
  return (
    <Box
      component="li"
      sx={{ color: ui.textMuted, fontSize: 13.5, lineHeight: 1.75, mb: 0.75 }}
    >
      {children}
    </Box>
  );
}

export default function RefundPolicyPage() {
  const lastUpdated = "01.02.2026";
  const productName = "Spravly";
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
                Політика повернення коштів (Refund Policy)
              </Typography>
              <Typography sx={{ color: ui.textMuted, fontSize: 13, mt: 0.5 }}>
                Останнє оновлення: {lastUpdated}
              </Typography>

              <Divider sx={{ my: 2, borderColor: ui.border }} />

              <P>
                Ця Політика повернення коштів описує умови, за яких користувач
                може отримати повернення платежів за підписку в{" "}
                <b>{productName}</b>. Використовуючи сервіс та/або здійснюючи
                оплату, ви погоджуєтесь із цією Політикою.
              </P>

              <SectionTitle>1. Загальне правило</SectionTitle>
              <P>
                Підписки на {productName} є цифровою послугою. Після активації
                доступу до платного плану,
                <b> платежі зазвичай не повертаються</b>, якщо інше не
                передбачено законом або цією Політикою.
              </P>

              <SectionTitle>2. Коли ми можемо зробити повернення</SectionTitle>
              <P>
                Ми можемо погодити повернення (повне або часткове) у таких
                ситуаціях:
              </P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>
                  <b>Подвійна оплата</b> або помилкове списання (наприклад, збої
                  платіжної системи).
                </Li>
                <Li>
                  <b>Неправильний план</b> був оплачений випадково, і ви
                  звернулися до підтримки одразу після оплати (як правило,
                  протягом 24 годин), і сервіс фактично не використовувався.
                </Li>
                <Li>
                  <b>Критична технічна проблема</b> з нашого боку, яка робить
                  сервіс недоступним або непридатним до використання протягом
                  значної частини оплаченного періоду (ми можемо запропонувати
                  пропорційне повернення або кредит/компенсацію).
                </Li>
              </Box>

              <SectionTitle>3. Коли повернення не надається</SectionTitle>
              <P>Повернення, як правило, не здійснюється у випадках:</P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>
                  ви передумали користуватися сервісом після початку періоду
                  підписки;
                </Li>
                <Li>ви не використовували сервіс, але доступ був наданий;</Li>
                <Li>
                  ваша проблема пов’язана з налаштуваннями, інтеграціями або
                  помилками введених даних з вашого боку;
                </Li>
                <Li>
                  ви порушили Умови користування, і доступ був
                  обмежений/припинений;
                </Li>
                <Li>
                  минув значний час від дати оплати (зазвичай понад 14 днів), і
                  сервіс використовувався.
                </Li>
              </Box>

              <SectionTitle>4. Скасування підписки ≠ повернення</SectionTitle>
              <P>
                Ви можете скасувати підписку у будь-який момент у налаштуваннях
                акаунту. Після скасування доступ до платного плану зберігається
                до кінця оплаченого періоду.
                <b> Скасування не означає автоматичного повернення коштів</b>.
              </P>

              <SectionTitle>5. Як подати запит на повернення</SectionTitle>
              <P>
                Напишіть у підтримку на <b>{supportEmail}</b> з email, який
                прив’язаний до акаунту, та вкажіть:
              </P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>дату та суму оплати;</Li>
                <Li>план підписки;</Li>
                <Li>короткий опис проблеми / причини звернення;</Li>
                <Li>
                  за можливості — чек/квитанцію або ID транзакції від платіжного
                  провайдера.
                </Li>
              </Box>

              <SectionTitle>
                6. Терміни розгляду та спосіб повернення
              </SectionTitle>
              <P>
                Ми зазвичай розглядаємо звернення протягом{" "}
                <b>3–7 робочих днів</b>. Якщо повернення схвалено, воно
                здійснюється тим самим способом, яким була проведена оплата
                (через платіжного провайдера). Термін зарахування коштів
                залежить від банку/провайдера і може займати додатковий час.
              </P>

              <SectionTitle>7. Контакти</SectionTitle>
              <P>
                Якщо у вас є питання щодо повернень — звертайтесь на{" "}
                <b>{supportEmail}</b>.
              </P>

              <Divider sx={{ my: 2.5, borderColor: ui.border }} />

              <Stack
                direction={{ xs: "column", sm: "row" }}
                spacing={1}
                justifyContent="flex-end"
              >
                <Button
                  component={Link}
                  href="/terms-and-conditions"
                  variant="outlined"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    borderColor: ui.border,
                    color: ui.text,
                    fontWeight: 900,
                    "&:hover": { borderColor: ui.border, bgcolor: "#F8FAFC" },
                  }}
                >
                  Умови користування
                </Button>
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
                    "&:hover": { borderColor: ui.border, bgcolor: "#F8FAFC" },
                  }}
                >
                  Політика конфіденційності
                </Button>

                <Button
                  component={Link}
                  href="/"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 900,
                    boxShadow: "none",
                    bgcolor: "#0F172A",
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
