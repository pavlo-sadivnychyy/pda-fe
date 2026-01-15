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

type Organization = {
  id: string;
  name: string;

  legalName?: string | null;
  beneficiaryName?: string | null;
  legalAddress?: string | null;
  vatId?: string | null;
  registrationNumber?: string | null;
  iban?: string | null;
  swiftBic?: string | null;
  bankName?: string | null;
  bankAddress?: string | null;
  paymentReferenceHint?: string | null;
};

type PaymentReadiness = {
  ua: { ready: boolean; missing: string[] };
  international: { ready: boolean; missing: string[] };
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

  // ✅ NEW
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
      <Typography variant="body2" sx={{ ...labelSx, minWidth: 190 }}>
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
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Реквізити для оплати (UA + International Invoice PDF)
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Заповни IBAN / банк / SWIFT — ці дані автоматично підставляться в
            PDF.
          </Typography>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />

        {/* ✅ NEW: readiness alerts */}
        {paymentReadiness && (
          <Stack spacing={1.2} sx={{ mb: 2 }}>
            <ReadinessAlert
              title="UA Invoice PDF"
              ready={paymentReadiness.ua.ready}
              missing={paymentReadiness.ua.missing}
            />
            <ReadinessAlert
              title="International Invoice PDF"
              ready={paymentReadiness.international.ready}
              missing={paymentReadiness.international.missing}
            />
          </Stack>
        )}

        {isView ? (
          <>
            <Box sx={{ px: 0.5 }}>
              <Row
                label="Beneficiary name"
                value={organization?.beneficiaryName}
              />
              <Row label="Legal name" value={organization?.legalName} />
              <Row label="VAT / Tax ID" value={organization?.vatId} />
              <Row
                label="Registration number"
                value={organization?.registrationNumber}
              />
              <Row label="Legal address" value={organization?.legalAddress} />
              <Divider sx={{ my: 1.5 }} />
              <Row label="IBAN" value={organization?.iban} />
              <Row label="SWIFT / BIC" value={organization?.swiftBic} />
              <Row label="Bank name" value={organization?.bankName} />
              <Row label="Bank address" value={organization?.bankAddress} />
              <Divider sx={{ my: 1.5 }} />
              <Row
                label="Payment reference hint"
                value={organization?.paymentReferenceHint}
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
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  variant={"standard"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Beneficiary name"
                  placeholder="Beneficiary name"
                  value={form.beneficiaryName}
                  onChange={onChange("beneficiaryName")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  fullWidth
                  variant={"standard"}
                  InputLabelProps={{ shrink: true }}
                  label="Legal name"
                  placeholder="Legal name"
                  value={form.legalName}
                  onChange={onChange("legalName")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant={"standard"}
                  label="VAT / Tax ID"
                  placeholder="VAT / Tax ID"
                  value={form.vatId}
                  onChange={onChange("vatId")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  variant={"standard"}
                  label="Registration number"
                  placeholder="Registration number"
                  value={form.registrationNumber}
                  onChange={onChange("registrationNumber")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <TextField
                  fullWidth
                  variant={"standard"}
                  InputLabelProps={{ shrink: true }}
                  label="Legal address"
                  placeholder="Legal address"
                  value={form.legalAddress}
                  onChange={onChange("legalAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  variant={"standard"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="IBAN"
                  value={form.iban}
                  onChange={onChange("iban")}
                  placeholder="UA00XXXX...."
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  variant={"standard"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="SWIFT / BIC"
                  value={form.swiftBic}
                  onChange={onChange("swiftBic")}
                  placeholder="XXXXXXXX / XXXXXXXXXXX"
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  variant={"standard"}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  label="Bank name"
                  placeholder="Bank name"
                  value={form.bankName}
                  onChange={onChange("bankName")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  variant={"standard"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Bank address"
                  placeholder="Bank address"
                  value={form.bankAddress}
                  onChange={onChange("bankAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 12, lg: 12 }}>
                <TextField
                  variant={"standard"}
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Payment reference hint"
                  value={form.paymentReferenceHint}
                  onChange={onChange("paymentReferenceHint")}
                  placeholder='e.g. "Use invoice number as reference"'
                />
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                gap: 1.25,
                mt: 2,
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
