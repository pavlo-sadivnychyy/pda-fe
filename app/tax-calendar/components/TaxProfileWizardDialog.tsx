"use client";

import {
  Button,
  Dialog,
  DialogContent,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";

import { taxCalendarApi } from "../taxCalendar.api";
import { taxKeys } from "../queries";
import type { TaxProfile } from "../types";

export function TaxProfileWizardDialog(props: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  initial: TaxProfile | null;
}) {
  const qc = useQueryClient();

  const initialUa = props.initial?.settings?.ua ?? {};

  const [entityType, setEntityType] = useState(
    props.initial?.entityType ?? "FOP",
  );

  const [timezone, setTimezone] = useState(
    props.initial?.timezone ?? "Europe/Kyiv",
  );

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

  const saveM = useMutation({
    mutationFn: (payload: any) => taxCalendarApi.upsertProfile(payload),
    onSuccess: async () => {
      await qc.invalidateQueries({
        queryKey: taxKeys.profile(props.organizationId),
      });
      await qc.invalidateQueries({
        queryKey: taxKeys.templates(props.organizationId),
      });
      await qc.invalidateQueries({ queryKey: ["tax"] });
      props.onClose();
    },
  });

  function handleSave() {
    const settings = {
      ua: {
        taxSystem,
        group: taxSystem === "single_tax" ? group : null,
        vat,
        hasEmployees,
        reporting: {
          singleTax: singleTaxReporting,
          esv: esvReporting,
        },
      },
    };

    saveM.mutate({
      organizationId: props.organizationId,
      jurisdiction: "UA",
      entityType,
      timezone,
      settings,
    });
  }

  const isFop = entityType === "FOP";

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="sm">
      <DialogTitle sx={{ fontWeight: 800 }}>
        Налаштування податкового профілю
      </DialogTitle>

      <DialogContent>
        <Stack gap={2.2} sx={{ pt: 1 }}>
          <Typography fontSize={13} color="text.secondary">
            Профіль застосовується до всієї організації
          </Typography>

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

          {isFop && (
            <>
              <Typography fontWeight={700}>Оподаткування</Typography>

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

              {taxSystem === "single_tax" && (
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
              )}

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

              <Typography fontWeight={700}>Звітність</Typography>

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
            </>
          )}

          <Stack direction="row" justifyContent="flex-end" gap={1.2} pt={1}>
            <Button
              onClick={props.onClose}
              variant="outlined"
              sx={{ borderRadius: "999px" }}
            >
              Скасувати
            </Button>

            <Button
              onClick={handleSave}
              variant="contained"
              disabled={saveM.isPending}
              sx={{
                borderRadius: "999px",
                boxShadow: "none",
                px: 3,
              }}
            >
              Зберегти
            </Button>
          </Stack>
        </Stack>
      </DialogContent>
    </Dialog>
  );
}
