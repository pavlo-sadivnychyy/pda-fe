"use client";

import {
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Grid,
  TextField,
  Typography,
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
            Реквізити для міжнародних оплат (для International Invoice PDF)
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Заповни IBAN/SWIFT і банк — ці дані автоматично підставляться в PDF.
          </Typography>
        }
      />

      <CardContent sx={{ pt: 0 }}>
        <Divider sx={{ mb: 2 }} />

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
                  "&:hover": { bgcolor: "#020617" },
                }}
              >
                Редагувати
              </Button>
            </Box>
          </>
        ) : (
          // ✅ Form mode (edit/create)
          <Box component="form" onSubmit={onSubmit}>
            <Grid container spacing={2}>
              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
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
                  label="Registration number"
                  placeholder="Registration number"
                  value={form.registrationNumber}
                  onChange={onChange("registrationNumber")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Legal address"
                  placeholder="Legal address"
                  value={form.legalAddress}
                  onChange={onChange("legalAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
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
                  fullWidth
                  InputLabelProps={{ shrink: true }}
                  label="Bank address"
                  placeholder="Bank address"
                  value={form.bankAddress}
                  onChange={onChange("bankAddress")}
                />
              </Grid>

              <Grid size={{ xs: 12, sm: 12, md: 6, lg: 6 }}>
                <TextField
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
