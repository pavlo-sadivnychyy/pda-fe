"use client";

import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
  Stack,
  Chip,
} from "@mui/material";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import type { FormValues } from "../hooks/useOrganizationProfilePage";
import type { PaymentReadiness } from "../hooks/useOrganizationProfilePage";

type Organization = {
  id: string;
  name: string;

  // UA
  uaCompanyName?: string | null;
  uaCompanyAddress?: string | null;
  uaEdrpou?: string | null;
  uaIpn?: string | null;
  uaIban?: string | null;
  uaBankName?: string | null;
  uaMfo?: string | null;
  uaAccountNumber?: string | null;
  uaBeneficiaryName?: string | null;
  uaPaymentPurposeHint?: string | null;

  // Intl
  intlLegalName?: string | null;
  intlBeneficiaryName?: string | null;
  intlLegalAddress?: string | null;
  intlVatId?: string | null;
  intlRegistrationNumber?: string | null;
  intlIban?: string | null;
  intlSwiftBic?: string | null;
  intlBankName?: string | null;
  intlBankAddress?: string | null;
  intlPaymentReferenceHint?: string | null;
};

type Props = {
  mode: "view" | "edit" | "create";
  hasOrganization: boolean;
  organization: Organization | null;
  form: FormValues;
  isSaving: boolean;
  onEdit: () => void;
  onCancel: () => void;
  onChange: (field: keyof FormValues) => any;
  onSubmit: (e: any) => void;
  paymentReadiness?: PaymentReadiness | null;
};

const cardSx = {
  borderRadius: 3,
  bgcolor: "#FFFFFF",
  border: "1px solid #E2E8F0",
  boxShadow:
    "0px 20px 25px -5px rgba(0,0,0,0.05), 0px 10px 10px -5px rgba(0,0,0,0.04)",
};

const labelSx = { color: "#64748b" };

function Row({ label, value }: { label: string; value?: string | null }) {
  return (
    <Box sx={{ display: "flex", gap: 2, py: 0.75 }}>
      <Typography variant="body2" sx={{ ...labelSx, minWidth: 210 }}>
        {label}
      </Typography>
      <Typography variant="body2" sx={{ color: "#0f172a", fontWeight: 600 }}>
        {value?.trim() ? value : "—"}
      </Typography>
    </Box>
  );
}

function ReadinessAlert({
  title,
  ready,
  missing,
}: {
  title: string;
  ready: boolean;
  missing: string[];
}) {
  if (ready) {
    return (
      <Alert
        severity="success"
        variant="outlined"
        sx={{ borderRadius: 2, bgcolor: "#f8fafc" }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
            {title}:
          </Typography>
          <Chip
            size="small"
            label="Готово"
            sx={{
              bgcolor: "rgba(22,163,74,0.10)",
              color: "#166534",
              fontWeight: 800,
              border: "1px solid rgba(22,163,74,0.22)",
            }}
          />
        </Box>
        <Typography variant="body2" sx={{ color: "#334155", mt: 0.5 }}>
          Реквізити заповнені — у PDF буде коректний блок для оплати.
        </Typography>
      </Alert>
    );
  }

  return (
    <Alert
      severity="warning"
      variant="outlined"
      sx={{ borderRadius: 2, bgcolor: "#fffbeb" }}
    >
      <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
        <Typography sx={{ fontWeight: 800, color: "#0f172a" }}>
          {title}:
        </Typography>
        <Chip
          size="small"
          label="Не вистачає"
          sx={{
            bgcolor: "rgba(245,158,11,0.14)",
            color: "#92400e",
            fontWeight: 800,
            border: "1px solid rgba(245,158,11,0.28)",
          }}
        />
      </Box>

      <Typography variant="body2" sx={{ color: "#334155", mt: 0.5 }}>
        PDF згенерується, але клієнту може бути незрозуміло, як оплатити.
      </Typography>

      <Box component="ul" sx={{ m: 0, mt: 1, pl: 2.2 }}>
        {missing.map((m) => (
          <Typography
            key={m}
            component="li"
            variant="body2"
            sx={{ color: "#92400e" }}
          >
            {m}
          </Typography>
        ))}
      </Box>
    </Alert>
  );
}

function SectionTitle({
  title,
  subtitle,
}: {
  title: string;
  subtitle: string;
}) {
  return (
    <Box sx={{ mb: 1.5 }}>
      <Typography sx={{ fontWeight: 900, color: "#0f172a" }}>
        {title}
      </Typography>
      <Typography variant="body2" sx={{ color: "#64748b" }}>
        {subtitle}
      </Typography>
    </Box>
  );
}

export function PaymentDetailsCard({
  mode,
  hasOrganization,
  organization,
  form,
  isSaving,
  onEdit,
  onCancel,
  onChange,
  onSubmit,
  paymentReadiness,
}: Props) {
  const isView = mode === "view" && hasOrganization && organization;

  return (
    <Card elevation={0} sx={cardSx}>
      <CardHeader
        avatar={
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: "999px",
              bgcolor: "#f8fafc",
              border: "1px solid #e2e8f0",
              display: "grid",
              placeItems: "center",
            }}
          >
            <CreditCardIcon sx={{ color: "#0f172a" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 900 }}>
            Реквізити для оплати
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Тут два окремі блоки: українські реквізити для UA документів і
            міжнародні — для International Invoice.
          </Typography>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />

        {paymentReadiness && (
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <ReadinessAlert
              title="UA документи"
              ready={paymentReadiness.ua.ready}
              missing={paymentReadiness.ua.missing}
            />
            <ReadinessAlert
              title="International invoice"
              ready={paymentReadiness.international.ready}
              missing={paymentReadiness.international.missing}
            />
          </Stack>
        )}

        {isView ? (
          <>
            {/* ===================== UA VIEW ===================== */}
            <SectionTitle
              title="🇺🇦 Українські реквізити"
              subtitle="Підставляються в українські інвойси/акти."
            />

            <Box sx={{ px: 0.5 }}>
              <Row label="Отримувач" value={organization?.uaBeneficiaryName} />
              <Row
                label="Назва (ФОП/ТОВ)"
                value={organization?.uaCompanyName}
              />
              <Row label="Адреса" value={organization?.uaCompanyAddress} />
              <Row label="ЄДРПОУ" value={organization?.uaEdrpou} />
              <Row label="ІПН" value={organization?.uaIpn} />
              <Divider sx={{ my: 1.5 }} />
              <Row label="IBAN" value={organization?.uaIban} />
              <Row label="Банк" value={organization?.uaBankName} />
              <Row label="МФО" value={organization?.uaMfo} />
              <Row
                label="Рахунок (якщо треба)"
                value={organization?.uaAccountNumber}
              />
              <Divider sx={{ my: 1.5 }} />
              <Row
                label="Призначення платежу (підказка)"
                value={organization?.uaPaymentPurposeHint}
              />
            </Box>

            <Divider sx={{ my: 2.5 }} />

            {/* ===================== INTL VIEW ===================== */}
            <SectionTitle
              title="🌍 International реквізити"
              subtitle="Підставляються тільки в International invoice PDF."
            />

            <Box sx={{ px: 0.5 }}>
              <Row
                label="Beneficiary name"
                value={organization?.intlBeneficiaryName}
              />
              <Row label="Legal name" value={organization?.intlLegalName} />
              <Row
                label="Legal address"
                value={organization?.intlLegalAddress}
              />
              <Row label="VAT / Tax ID" value={organization?.intlVatId} />
              <Row
                label="Registration number"
                value={organization?.intlRegistrationNumber}
              />
              <Divider sx={{ my: 1.5 }} />
              <Row label="IBAN" value={organization?.intlIban} />
              <Row label="SWIFT / BIC" value={organization?.intlSwiftBic} />
              <Row label="Bank name" value={organization?.intlBankName} />
              <Row label="Bank address" value={organization?.intlBankAddress} />
              <Divider sx={{ my: 1.5 }} />
              <Row
                label="Payment reference hint"
                value={organization?.intlPaymentReferenceHint}
              />
            </Box>

            <Box sx={{ display: "flex", justifyContent: "flex-end", mt: 2 }}>
              <Button
                onClick={onEdit}
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  bgcolor: "#111827",
                  color: "white",
                  "&:hover": { bgcolor: "#020617" },
                }}
              >
                Редагувати
              </Button>
            </Box>
          </>
        ) : (
          <Box component="form" onSubmit={onSubmit}>
            {/* ===================== UA EDIT ===================== */}
            <SectionTitle
              title="🇺🇦 Українські реквізити"
              subtitle="Тільки для UA документів. Заповнюй українською."
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Отримувач"
                  value={form.uaBeneficiaryName}
                  onChange={onChange("uaBeneficiaryName")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Назва (ФОП/ТОВ)"
                  value={form.uaCompanyName}
                  onChange={onChange("uaCompanyName")}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Адреса"
                  value={form.uaCompanyAddress}
                  onChange={onChange("uaCompanyAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="ЄДРПОУ"
                  value={form.uaEdrpou}
                  onChange={onChange("uaEdrpou")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="ІПН"
                  value={form.uaIpn}
                  onChange={onChange("uaIpn")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="IBAN"
                  value={form.uaIban}
                  onChange={onChange("uaIban")}
                  placeholder="UA00...."
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Назва банку"
                  value={form.uaBankName}
                  onChange={onChange("uaBankName")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="МФО"
                  value={form.uaMfo}
                  onChange={onChange("uaMfo")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Рахунок (не обов'язково)"
                  value={form.uaAccountNumber}
                  onChange={onChange("uaAccountNumber")}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Призначення платежу (підказка)"
                  value={form.uaPaymentPurposeHint}
                  onChange={onChange("uaPaymentPurposeHint")}
                  placeholder='Напр. "Оплата за інвойсом №..."'
                />
              </Grid>
            </Grid>

            <Divider sx={{ my: 3 }} />

            {/* ===================== INTL EDIT ===================== */}
            <SectionTitle
              title="🌍 International реквізити"
              subtitle="Тільки для International invoice. Заповнюй англійською."
            />

            <Grid container spacing={2}>
              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Beneficiary name"
                  value={form.intlBeneficiaryName}
                  onChange={onChange("intlBeneficiaryName")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Legal name"
                  value={form.intlLegalName}
                  onChange={onChange("intlLegalName")}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Legal address"
                  value={form.intlLegalAddress}
                  onChange={onChange("intlLegalAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="VAT / Tax ID"
                  value={form.intlVatId}
                  onChange={onChange("intlVatId")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Registration number"
                  value={form.intlRegistrationNumber}
                  onChange={onChange("intlRegistrationNumber")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="IBAN"
                  value={form.intlIban}
                  onChange={onChange("intlIban")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="SWIFT / BIC"
                  value={form.intlSwiftBic}
                  onChange={onChange("intlSwiftBic")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Bank name"
                  value={form.intlBankName}
                  onChange={onChange("intlBankName")}
                />
              </Grid>

              <Grid size={{ xs: 12, md: 6 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Bank address"
                  value={form.intlBankAddress}
                  onChange={onChange("intlBankAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12 }}>
                <TextField
                  variant="standard"
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Payment reference hint"
                  value={form.intlPaymentReferenceHint}
                  onChange={onChange("intlPaymentReferenceHint")}
                  placeholder='e.g. "Use invoice number as reference"'
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.25,
                mt: 2.5,
              }}
            >
              <Button
                onClick={onCancel}
                disabled={isSaving}
                variant="outlined"
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  borderColor: "#111827",
                  color: "#111827",
                  "&:hover": {
                    borderColor: "#020617",
                    bgcolor: "rgba(15,23,42,0.04)",
                  },
                }}
              >
                Скасувати
              </Button>
              <Button
                type="submit"
                disabled={isSaving}
                variant="contained"
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  bgcolor: "#111827",
                  color: "white",
                  "&:hover": { bgcolor: "#020617" },
                }}
              >
                {isSaving ? "Зберігаємо..." : "Зберегти"}
              </Button>
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
