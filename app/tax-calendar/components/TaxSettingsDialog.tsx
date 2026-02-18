"use client";

import {
  Alert,
  Box,
  Dialog,
  DialogContent,
  DialogTitle,
  Tab,
  Tabs,
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";

import type { TaxProfile, TaxEventTemplate } from "../types";
import { TaxProfileWizardForm } from "./TaxProfileWizardForm";
import { TaxTemplatesManager } from "./TaxTemplatesManager";

export function TaxSettingsDialog(props: {
  open: boolean;
  onClose: () => void;
  organizationId: string;
  initialProfile: TaxProfile | null;
  templates: TaxEventTemplate[];
}) {
  const [tab, setTab] = useState<0 | 1>(0);

  const initial = useMemo(() => props.initialProfile, [props.initialProfile]);

  const hasProfile = Boolean(initial?.id);
  const templatesDisabled = !hasProfile;

  // ✅ якщо профіль зник/ще не створений — не даємо бути на табі шаблонів
  useEffect(() => {
    if (templatesDisabled && tab === 1) setTab(0);
  }, [templatesDisabled, tab]);

  // ✅ при відкритті діалогу теж гарантуємо валідний таб
  useEffect(() => {
    if (!props.open) return;
    if (templatesDisabled) setTab(0);
  }, [props.open, templatesDisabled]);

  return (
    <Dialog open={props.open} onClose={props.onClose} fullWidth maxWidth="md">
      <DialogTitle sx={{ fontWeight: 900 }}>Профіль і шаблони</DialogTitle>

      <DialogContent>
        <Tabs value={tab} onChange={(_, v) => setTab(v)} sx={{ mb: 2 }}>
          <Tab label="Податковий профіль" />
          <Tab label="Автоправила (шаблони)" disabled={templatesDisabled} />
        </Tabs>

        {templatesDisabled ? (
          <Alert severity="info" sx={{ mb: 2, borderRadius: "12px" }}>
            Спочатку створи <b>податковий профіль</b>. Після збереження
            відкриються шаблони (автоправила), за якими генеруються події.
          </Alert>
        ) : null}

        <Box hidden={tab !== 0}>
          <TaxProfileWizardForm
            organizationId={props.organizationId}
            initial={initial}
            onDone={props.onClose}
          />
        </Box>

        <Box hidden={tab !== 1}>
          <TaxTemplatesManager
            organizationId={props.organizationId}
            templates={props.templates}
          />
        </Box>
      </DialogContent>
    </Dialog>
  );
}
