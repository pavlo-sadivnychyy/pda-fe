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
 * app/privacy-policy/page.tsx
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

export default function PrivacyPolicyPage() {
  const lastUpdated = "01.02.2026";
  const productName = "Spravly";
  const supportEmail = "support@spravly.app";

  // TODO (за потреби): додай юр.дані компанії/ФОП
  const controllerName = `${productName} (власник/адміністратор сервісу)`;

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
            На головну
          </Button>

          <SoftCard>
            <CardContent sx={{ p: { xs: 2, md: 3 } }}>
              <Typography
                sx={{ fontSize: 22, fontWeight: 1000, color: ui.text }}
              >
                Політика конфіденційності
              </Typography>
              <Typography sx={{ color: ui.textMuted, fontSize: 13, mt: 0.5 }}>
                Останнє оновлення: {lastUpdated}
              </Typography>

              <Divider sx={{ my: 2, borderColor: ui.border }} />

              <P>
                Ця Політика конфіденційності пояснює, які дані збирає{" "}
                {productName}, як ми їх використовуємо та які права має
                Користувач. Використовуючи {productName}, ви погоджуєтесь з цією
                Політикою.
              </P>

              <SectionTitle>1. Хто ми</SectionTitle>
              <P>
                Адміністратор (контролер даних): <b>{controllerName}</b>. Якщо у
                вас є питання щодо конфіденційності — пишіть на{" "}
                <b>{supportEmail}</b>.
              </P>

              <SectionTitle>2. Які дані ми збираємо</SectionTitle>
              <P>Ми можемо збирати такі категорії даних:</P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>
                  <b>Дані акаунту</b>: ім’я, прізвище, email, аватар,
                  ідентифікатор користувача, дані організації (назва,
                  налаштування).
                </Li>
                <Li>
                  <b>Бізнес-дані</b>, які ви додаєте в сервіс: клієнти
                  (контакти), інвойси, акти, комерційні пропозиції,
                  товари/послуги, задачі, нотатки, вкладені файли.
                </Li>
                <Li>
                  <b>Платіжні дані</b>: інформація про підписку (план, статус,
                  дати оплат, країна/податки). Ми не зберігаємо повні дані
                  банківських карток — їх обробляє платіжний провайдер.
                </Li>
                <Li>
                  <b>Технічні дані</b>: IP-адреса (частково), тип
                  браузера/пристрою, журнали помилок, час доступу, діагностичні
                  події (для стабільності та безпеки).
                </Li>
                {/*<Li>*/}
                {/*  <b>Дані взаємодії з AI</b>: ваші запити до AI-асистента та*/}
                {/*  відповіді, які генерує сервіс, у межах функціоналу та*/}
                {/*  налаштувань (див. розділ 6).*/}
                {/*</Li>*/}
              </Box>

              <SectionTitle>3. Як ми використовуємо дані</SectionTitle>
              <P>Ми використовуємо дані для:</P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>
                  надання та підтримки роботи сервісу (акаунт, документи, PDF,
                  email-відправки, аналітика);
                </Li>
                <Li>
                  обробки підписок та платежів (через платіжного провайдера);
                </Li>
                <Li>
                  покращення продукту, виправлення помилок, запобігання
                  зловживанням;
                </Li>
                <Li>служби підтримки та відповіді на ваші запити;</Li>
                <Li>виконання юридичних обов’язків (за потреби).</Li>
              </Box>

              <SectionTitle>4. Правові підстави обробки</SectionTitle>
              <P>
                Ми обробляємо дані на підставі: (a) виконання договору (надання
                сервісу), (b) вашої згоди (наприклад, на маркетингові листи —
                якщо будете підписані), (c) законного інтересу (безпека,
                антифрод, аналітика продукту), та/або (d) юридичних зобов’язань.
              </P>

              <SectionTitle>5. З ким ми ділимося даними</SectionTitle>
              <P>
                Ми не продаємо персональні дані. Ми можемо передавати дані лише
                постачальникам, які допомагають надавати сервіс, наприклад:
              </P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>
                  <b>Платіжний провайдер</b> — для обробки оплат та підписок.
                </Li>
                <Li>
                  <b>Хостинг/інфраструктура</b> — для зберігання даних і роботи
                  сервісу.
                </Li>
                <Li>
                  <b>Email-провайдер</b> — якщо ви користуєтесь функцією
                  відправки документів на email.
                </Li>
                <Li>
                  <b>Аналітика/логування</b> — для стабільності та покращення
                  продукту (без “зайвих” персональних даних).
                </Li>
              </Box>
              <P>
                Постачальники отримують лише мінімально необхідні дані й
                зобов’язані дотримуватися конфіденційності.
              </P>

              {/*<SectionTitle>6. AI-асистент і ваші дані</SectionTitle>*/}
              {/*<P>*/}
              {/*  {productName} може використовувати ваші дані (наприклад,*/}
              {/*  інвойси, клієнтів, історію документів) для того, щоб AI-асистент*/}
              {/*  надавав релевантні відповіді та підказки. Ви контролюєте, що*/}
              {/*  саме вводите в запити до AI. Не вводьте чутливі дані, якщо ви не*/}
              {/*  хочете, щоб вони використовувались для генерації відповіді.*/}
              {/*</P>*/}
              {/*<P>*/}
              {/*  Важливо: AI може помилятися. Ви самостійно перевіряєте відповіді*/}
              {/*  перед використанням у бізнес-процесах.*/}
              {/*</P>*/}

              <SectionTitle>7. Cookies та трекінг</SectionTitle>
              <P>
                Ми можемо використовувати cookies або аналогічні технології для
                авторизації, збереження сесії, базової аналітики та покращення
                UX. Ви можете керувати cookies у налаштуваннях браузера, але це
                може вплинути на роботу сервісу.
              </P>

              <SectionTitle>8. Зберігання даних</SectionTitle>
              <P>
                Ми зберігаємо дані стільки, скільки це необхідно для надання
                сервісу, виконання законних зобов’язань та вирішення спорів. При
                видаленні акаунту дані можуть бути видалені або анонімізовані,
                якщо інше не вимагається законом.
              </P>

              <SectionTitle>9. Безпека</SectionTitle>
              <P>
                Ми застосовуємо розумні технічні та організаційні заходи
                захисту. Водночас жодна система не гарантує 100% безпеки, тому
                ми не можемо гарантувати абсолютний захист від усіх ризиків.
              </P>

              <SectionTitle>10. Ваші права</SectionTitle>
              <P>Ви можете мати право:</P>
              <Box component="ul" sx={{ pl: 2.5, my: 1 }}>
                <Li>отримати доступ до своїх даних;</Li>
                <Li>виправити або оновити дані;</Li>
                <Li>видалити дані (за певних умов);</Li>
                <Li>обмежити або заперечити обробку;</Li>
                <Li>отримати копію даних (портативність), якщо застосовно.</Li>
              </Box>
              <P>
                Щоб скористатися правами — напишіть на <b>{supportEmail}</b> з
                email, прив’язаного до акаунту.
              </P>

              <SectionTitle>11. Діти</SectionTitle>
              <P>
                Сервіс не призначений для осіб, які не досягли повноліття. Ми не
                збираємо свідомо дані дітей.
              </P>

              <SectionTitle>12. Зміни до Політики</SectionTitle>
              <P>
                Ми можемо оновлювати цю Політику. Продовжуючи користуватись
                сервісом після змін, ви погоджуєтесь з оновленою версією.
              </P>

              <SectionTitle>13. Контакти</SectionTitle>
              <P>
                Якщо у вас є питання або запити щодо приватності — пишіть на{" "}
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
                  href="/"
                  variant="contained"
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    fontWeight: 900,
                    boxShadow: "none",
                    color: "white",
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
