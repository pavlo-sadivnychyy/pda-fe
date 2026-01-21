import * as React from "react";
import { Box } from "@mui/material";
import { ActionBtn } from "@/components/Onboarding/ActionBtn";
import { StepCard } from "@/components/Onboarding/StepCard";
import { BackgroundMotion } from "./BackgroundMotion";
import Image from "next/image";

export function OrgGateModal({
  open,
  onLater,
  onCreateOrg,
  allowClose = true,
}: {
  open: boolean;
  onLater: () => Promise<void> | void;
  onCreateOrg: () => Promise<void> | void;
  allowClose?: boolean;
}) {
  const [step, setStep] = React.useState<1 | 2 | 3>(1);
  const [submitting, setSubmitting] = React.useState(false);

  React.useEffect(() => {
    if (open) setStep(1);
  }, [open]);

  const next = React.useCallback(() => {
    setStep((s) => (s === 1 ? 2 : s === 2 ? 3 : 3));
  }, []);

  const prev = React.useCallback(() => {
    setStep((s) => (s === 3 ? 2 : s === 2 ? 1 : 1));
  }, []);

  const safe = React.useCallback(
    async (fn: () => Promise<void> | void) => {
      if (submitting) return;
      setSubmitting(true);
      try {
        await fn();
      } finally {
        setSubmitting(false);
      }
    },
    [submitting],
  );

  if (!open) return null;

  const steps = [
    { id: 1, title: "Організація", subtitle: "Обовʼязковий перший крок" },
    {
      id: 2,
      title: "Клієнти й документи",
      subtitle: "Відкриється після організації",
    },
    { id: 3, title: "AI-асистент", subtitle: "Працює найкраще з контекстом" },
  ] as const;

  const content =
    step === 1 ? (
      <StepCard
        tone="primary"
        title="Крок 1 — Створи організацію"
        badge="Обовʼязково"
        text="Заповни профіль бізнесу: назва, реквізити, місто, сфера. Це потрібно, щоб інвойси/акти генерувалися правильно."
        hint="Після цього відкриється весь функціонал дашборду."
      />
    ) : step === 2 ? (
      <StepCard
        tone="muted"
        title="Крок 2 — Клієнти, документи, фінанси"
        badge="Після Кроку 1"
        text="Тут ти додаси клієнтів, створиш інвойси/акти/пропозиції та будеш бачити історію документів в одному місці."
        hint="Без організації ми не знаємо, які реквізити підставляти."
        lockedIcon
      />
    ) : (
      <StepCard
        tone="muted"
        title="Крок 3 — AI асистент (максимальна користь)"
        badge="Після Кроку 1"
        text="AI буде давати точні відповіді по твоєму бізнесу та генерувати документи з правильними даними."
        hint="Організація = контекст. Контекст = якісні результати."
        lockedIcon
      />
    );

  return (
    <Box
      sx={{
        position: "fixed",
        inset: 0,
        zIndex: 20000,
        bgcolor: "#fff",
        overflow: "hidden",
        // невеликий fade-in щоб виглядало плавно
        animation: "gateFadeIn 160ms ease",
        "@keyframes gateFadeIn": {
          from: { opacity: 0 },
          to: { opacity: 1 },
        },
      }}
    >
      {/* top bar */}
      <Box
        sx={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          px: { xs: 2, sm: 3 },
          py: 2,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Box sx={{ display: "flex", alignItems: "end" }}>
          <Image
            src="/spravly-icon.png"
            alt="Spravly"
            width={32}
            height={32}
            priority
          />
        </Box>
      </Box>

      {/* content */}
      <Box
        sx={{
          position: "absolute",
          inset: 0,
          pt: 10,
          px: { xs: 2, sm: 3 },
          pb: 3,
          display: "grid",
          placeItems: "center",
        }}
      >
        <Box sx={{ width: "min(980px, 100%)" }}>
          {/* stepper */}
          <Box sx={{ display: "grid", gap: 1.25, mb: { xs: 2.5, sm: 3 } }}>
            <Box
              sx={{
                display: "grid",
                gridTemplateColumns: { xs: "1fr", sm: "repeat(3, 1fr)" },
                gap: 1,
              }}
            >
              {steps.map((s) => (
                <Box
                  key={s.id}
                  sx={{
                    borderRadius: 3,
                    border: "1px solid rgba(0,0,0,0.10)",
                    p: 1.25,
                    background:
                      step === s.id
                        ? "rgba(251,145,46,0.10)"
                        : "rgba(0,0,0,0.02)",
                    transition: "background 160ms ease",
                  }}
                >
                  <Box sx={{ fontWeight: 950, fontSize: 14 }}>
                    {s.id}. {s.title}
                  </Box>
                  <Box
                    sx={{ fontSize: 12, color: "rgba(0,0,0,0.62)", mt: 0.25 }}
                  >
                    {s.subtitle}
                  </Box>
                </Box>
              ))}
            </Box>

            <Box
              sx={{
                height: 8,
                borderRadius: 999,
                bgcolor: "rgba(0,0,0,0.06)",
                overflow: "hidden",
              }}
            >
              <Box
                sx={{
                  height: "100%",
                  width: step === 1 ? "33.33%" : step === 2 ? "66.66%" : "100%",
                  bgcolor: "#ffbf57",
                  transition: "width 220ms ease",
                }}
              />
            </Box>
          </Box>

          {/* hero */}
          <Box sx={{ textAlign: "center", mb: { xs: 2, sm: 3 } }}>
            <Box
              sx={{
                fontWeight: 980,
                fontSize: { xs: 20, sm: 28 },
                lineHeight: 1.05,
                letterSpacing: "-0.02em",
              }}
            >
              {step === 1
                ? "Починаємо з організації"
                : step === 2
                  ? "Далі — робота з клієнтами й документами"
                  : "І вишенька — AI, який реально допомагає"}
            </Box>
            <Box sx={{ mt: 1, fontSize: 14, color: "rgba(0,0,0,0.70)" }}>
              {step === 1
                ? "Щоб все працювало правильно — спершу потрібні дані бізнесу."
                : step === 2
                  ? "Коли є організація, документи будуть з правильними реквізитами."
                  : "З контекстом бізнесу AI дає точні відповіді і генерує документи без помилок."}
            </Box>
          </Box>

          {content}

          {/* controls */}
          <Box
            sx={{
              display: "flex",
              justifyContent: "center",
              gap: 1,
              mt: { xs: 2.5, sm: 3 },
              flexWrap: "wrap",
            }}
          >
            <ActionBtn
              variant="ghost"
              disabled={step === 1 || submitting}
              onClick={prev}
              label="Назад"
            />

            {step < 3 ? (
              <ActionBtn
                variant="primary"
                disabled={submitting}
                onClick={next}
                label="Далі"
              />
            ) : (
              <ActionBtn
                variant="primary"
                disabled={submitting}
                onClick={() => safe(onCreateOrg)}
                label={submitting ? "Зачекай..." : "Створити організацію"}
              />
            )}

            {allowClose ? (
              <ActionBtn
                variant="text"
                disabled={submitting}
                onClick={() => safe(onLater)}
                label={submitting ? "Зачекай..." : "Пропустити"}
              />
            ) : null}
          </Box>
        </Box>
      </Box>

      <BackgroundMotion />
    </Box>
  );
}
