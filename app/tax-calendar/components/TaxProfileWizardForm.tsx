"use client";

import {
  Alert,
  Button,
  FormControl,
  FormControlLabel,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";

import { taxCalendarApi } from "../taxCalendar.api";
import { taxKeys } from "../queries";
import type { TaxProfile } from "../types";

export function TaxProfileWizardForm(props: {
  organizationId: string;
  initial: TaxProfile | null;
  onDone: () => void;
}) {
  const qc = useQueryClient();

  const initialUa = props.initial?.settings?.ua ?? {};

  const [entityType, setEntityType] = useState(
    props.initial?.entityType ?? "FOP",
  );
  const [timezone, setTimezone] = useState(
    props.initial?.timezone ?? "Europe/Kyiv",
  );

  const isFop = entityType === "FOP";

  const [taxSystem, setTaxSystem] = useState(
    initialUa.taxSystem ?? "single_tax",
  );
  const [group, setGroup] = useState<number>(initialUa.group ?? 3);
  const [vat, setVat] = useState<boolean>(initialUa.vat ?? false);
  const [hasEmployees, setHasEmployees] = useState<boolean>(
    initialUa.hasEmployees ?? false,
  );

  const [singleTaxReporting, setSingleTaxReporting] = useState(
    initialUa.reporting?.singleTax ?? "quarterly",
  );
  const [esvReporting, setEsvReporting] = useState(
    initialUa.reporting?.esv ?? "quarterly",
  );

  const payload = useMemo(() => {
    const settings = {
      ua: {
        taxSystem,
        group: isFop && taxSystem === "single_tax" ? group : null,
        vat,
        hasEmployees,
        reporting: {
          singleTax: singleTaxReporting,
          esv: esvReporting,
        },
      },
    };

    return {
      organizationId: props.organizationId,
      jurisdiction: "UA",
      entityType,
      timezone,
      settings,
    };
  }, [
    props.organizationId,
    entityType,
    timezone,
    taxSystem,
    group,
    vat,
    hasEmployees,
    singleTaxReporting,
    esvReporting,
    isFop,
  ]);

  const saveM = useMutation({
    mutationFn: () => taxCalendarApi.upsertProfile(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: taxKeys.profile(props.organizationId),
      });
      await qc.invalidateQueries({
        queryKey: taxKeys.templates(props.organizationId),
      });
      await qc.invalidateQueries({ queryKey: ["tax"] });
      props.onDone();
    },
  });

  return (
    <Stack gap={2}>
      <Alert severity="info" sx={{ borderRadius: "12px" }}>
        <Typography fontWeight={800}>Що це дає?</Typography>
        <Typography fontSize={13} color="text.secondary">
          Профіль потрібен, щоб система розуміла контекст організації і могла
          створювати правильні події за шаблонами.
        </Typography>
      </Alert>

      <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
        <FormControl fullWidth>
          <InputLabel>Тип субʼєкта</InputLabel>
          <Select
            label="Тип субʼєкта"
            value={entityType}
            onChange={(e) => setEntityType(e.target.value)}
          >
            <MenuItem value="FOP">ФОП</MenuItem>
            <MenuItem value="LLC">ТОВ</MenuItem>
            <MenuItem value="OTHER">Інше</MenuItem>
          </Select>
        </FormControl>

        <TextField
          label="Timezone"
          value={timezone}
          onChange={(e) => setTimezone(e.target.value)}
          fullWidth
        />
      </Stack>

      {isFop ? (
        <>
          <Typography fontWeight={900}>Оподаткування (ФОП)</Typography>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
            <FormControl fullWidth>
              <InputLabel>Система</InputLabel>
              <Select
                label="Система"
                value={taxSystem}
                onChange={(e) => setTaxSystem(e.target.value)}
              >
                <MenuItem value="single_tax">Єдиний податок</MenuItem>
                <MenuItem value="general">Загальна система</MenuItem>
              </Select>
            </FormControl>

            {taxSystem === "single_tax" ? (
              <FormControl fullWidth>
                <InputLabel>Група</InputLabel>
                <Select
                  label="Група"
                  value={group}
                  onChange={(e) => setGroup(Number(e.target.value))}
                >
                  <MenuItem value={1}>Група 1</MenuItem>
                  <MenuItem value={2}>Група 2</MenuItem>
                  <MenuItem value={3}>Група 3</MenuItem>
                </Select>
              </FormControl>
            ) : (
              <TextField label="Група" value="—" disabled fullWidth />
            )}
          </Stack>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
            <FormControlLabel
              control={
                <Switch
                  checked={vat}
                  onChange={(e) => setVat(e.target.checked)}
                />
              }
              label="Платник ПДВ"
            />
            <FormControlLabel
              control={
                <Switch
                  checked={hasEmployees}
                  onChange={(e) => setHasEmployees(e.target.checked)}
                />
              }
              label="Є працівники"
            />
          </Stack>

          <Typography fontWeight={900}>Звітність</Typography>

          <Stack direction={{ xs: "column", sm: "row" }} gap={1.25}>
            <FormControl fullWidth>
              <InputLabel>Єдиний податок</InputLabel>
              <Select
                label="Єдиний податок"
                value={singleTaxReporting}
                onChange={(e) => setSingleTaxReporting(e.target.value)}
              >
                <MenuItem value="quarterly">Щоквартально</MenuItem>
                <MenuItem value="yearly">Щорічно</MenuItem>
              </Select>
            </FormControl>

            <FormControl fullWidth>
              <InputLabel>ЄСВ</InputLabel>
              <Select
                label="ЄСВ"
                value={esvReporting}
                onChange={(e) => setEsvReporting(e.target.value)}
              >
                <MenuItem value="monthly">Щомісячно</MenuItem>
                <MenuItem value="quarterly">Щоквартально</MenuItem>
              </Select>
            </FormControl>
          </Stack>
        </>
      ) : null}

      <Stack direction="row" justifyContent="flex-end" gap={1}>
        <Button
          variant="outlined"
          onClick={props.onDone}
          sx={{ borderRadius: "999px", borderColor: "black", color: "black" }}
        >
          Закрити
        </Button>

        <Button
          variant="contained"
          onClick={() => saveM.mutate()}
          disabled={saveM.isPending}
          sx={{
            textTransform: "none",
            borderRadius: 999,
            py: 1,
            bgcolor: "#111827",
            boxShadow: "none",
            color: "white",
            "&:hover": {
              bgcolor: "#000000",
              boxShadow: "none",
            },
          }}
        >
          Зберегти
        </Button>
      </Stack>
    </Stack>
  );
}
