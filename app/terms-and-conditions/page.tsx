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
 * app/terms-and-conditions/page.tsx
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
  const lastUpdated = "01.02.2026";
  const productName = "Spravly";
  const supportEmail = "support@spravly.app";

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: ui.pageBg, py: { xs: 2, md: 4 } }}>
      <Container maxWidth="md">
        <Stack spacing={2}>
          {/* Back */}
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

              <P>
                Ласкаво просимо до <b>{productName}</b> (далі — «Сервіс»). Ці
                Умови користування (далі — «Умови») регулюють доступ та
                використання додатку {productName}, вебсайту та пов’язаних
                сервісів.
              </P>

              <P>
                Використовуючи Сервіс або створюючи обліковий запис, ви
                підтверджуєте, що ознайомились і погоджуєтесь з цими Умовами.
                Якщо ви не погоджуєтесь з будь-якою частиною Умов — не
                використовуйте Сервіс.
              </P>

              <SectionTitle>1. Визначення</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>
                  <b>Сервіс</b> — додаток {productName}, включно з усіма
                  функціями, AI-інструментами, підписками та контентом.
                </Li>
                <Li>
                  <b>Користувач</b> — фізична або юридична особа, яка
                  користується Сервісом.
                </Li>
                <Li>
                  <b>Підписка</b> — тарифний план (FREE, BASIC, PRO), що
                  визначає доступні функції та ліміти.
                </Li>
                <Li>
                  <b>Контент</b> — будь-які дані, документи, інвойси, файли або
                  матеріали, завантажені чи створені Користувачем.
                </Li>
              </Box>

              <SectionTitle>2. Реєстрація акаунту</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>
                  Ви зобов’язані надавати достовірну та актуальну інформацію.
                </Li>
                <Li>
                  Ви несете відповідальність за збереження доступу до свого
                  акаунту.
                </Li>
                <Li>
                  Усі дії, виконані з вашого акаунту, вважаються виконаними
                  вами.
                </Li>
              </Box>

              <SectionTitle>3. Плани підписки</SectionTitle>
              <P>
                {productName} пропонує безкоштовні та платні підписки.
                Функціонал, ліміти та ціни можуть змінюватися з попереднім
                повідомленням.
              </P>

              <Box sx={{ mt: 1 }}>
                <Typography sx={{ fontWeight: 900, color: ui.text }}>
                  FREE
                </Typography>
                <Box component="ul" sx={{ pl: 2.5 }}>
                  <Li>Вартість: $0</Li>
                  <Li>Обмежений доступ до функцій.</Li>
                  <Li>Призначений для тестування сервісу.</Li>
                </Box>

                <Typography sx={{ fontWeight: 900, color: ui.text, mt: 2 }}>
                  BASIC
                </Typography>
                <Box component="ul" sx={{ pl: 2.5 }}>
                  <Li>Вартість: $9.99 / місяць</Li>
                  <Li>Для щоденної роботи ФОП та малого бізнесу.</Li>
                  <Li>Збільшені ліміти та доступ до PDF-документів.</Li>
                </Box>

                <Typography sx={{ fontWeight: 900, color: ui.text, mt: 2 }}>
                  PRO
                </Typography>
                <Box component="ul" sx={{ pl: 2.5 }}>
                  <Li>Вартість: $19.99 / місяць</Li>
                  <Li>Повний доступ до функціоналу без лімітів.</Li>
                  <Li>AI без обмежень, аналітика та пріоритетна підтримка.</Li>
                </Box>
              </Box>

              <SectionTitle>4. Оплата та білінг</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>Оплата здійснюється щомісяця.</Li>
                <Li>Платежі обробляються стороннім платіжним провайдером.</Li>
                <Li>
                  Кошти не повертаються, окрім випадків, передбачених
                  законодавством.
                </Li>
                <Li>
                  Податки (включно з ПДВ, якщо застосовно) можуть додаватися
                  залежно від країни користувача.
                </Li>
              </Box>

              <SectionTitle>5. Продовження та скасування</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>Платні підписки поновлюються автоматично.</Li>
                <Li>Скасування доступне у будь-який момент у налаштуваннях.</Li>
                <Li>
                  Після скасування підписка діє до кінця оплаченого періоду.
                </Li>
                <Li>
                  Пониження тарифу може призвести до втрати доступу до частини
                  даних понад нові ліміти.
                </Li>
              </Box>

              <SectionTitle>6. AI-асистент</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>
                  AI-асистент надає рекомендації та автоматизує робочі процеси.
                </Li>
                <Li>
                  Результати роботи AI можуть містити помилки або неточності.
                </Li>
                <Li>
                  Користувач самостійно перевіряє та несе відповідальність за
                  використання AI-контенту.
                </Li>
              </Box>

              <SectionTitle>7. Контент і права</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>Усі права на Контент залишаються за Користувачем.</Li>
                <Li>
                  Ви надаєте {productName} обмежене право обробляти Контент лише
                  для надання Сервісу.
                </Li>
              </Box>

              <SectionTitle>8. Доступність сервісу</SectionTitle>
              <Box component="ul" sx={{ pl: 2.5 }}>
                <Li>Сервіс надається «як є».</Li>
                <Li>
                  Можливі тимчасові перебої через оновлення або технічні роботи.
                </Li>
              </Box>

              <SectionTitle>9. Обмеження відповідальності</SectionTitle>
              <P>
                {productName} не несе відповідальності за непрямі збитки, втрату
                прибутку або даних. Максимальна відповідальність обмежується
                сумою, сплаченою за останні 12 місяців користування Сервісом.
              </P>

              <SectionTitle>10. Контакти</SectionTitle>
              <P>
                Якщо у вас є питання щодо цих Умов, звертайтесь на{" "}
                <b>{supportEmail}</b>.
              </P>

              <Divider sx={{ my: 2.5, borderColor: ui.border }} />

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
                Повернутись на головну
              </Button>
            </CardContent>
          </SoftCard>
        </Stack>
      </Container>
    </Box>
  );
}
