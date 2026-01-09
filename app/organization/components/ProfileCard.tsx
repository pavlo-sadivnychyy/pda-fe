"use client";

import { Box, Card, CardContent, CardHeader, Typography } from "@mui/material";
import { ProfileViewContent } from "@/components/ProfileViewContent/ProfileViewContent";
import { ProfileFormContent } from "@/components/ProfileFormContent/ProfileFormContent";
import type { FormValues } from "../hooks/useOrganizationProfilePage";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";

type Organization = {
  id: string;
  name: string;
  industry?: string | null;
  description?: string | null;
  websiteUrl?: string | null;
  country?: string | null;
  city?: string | null;
  timeZone?: string | null;
  defaultLanguage?: string | null;
  defaultCurrency?: string | null;
  businessNiche?: string | null;
  servicesDescription?: string | null;
  targetAudience?: string | null;
  brandStyle?: string | null;
};

type Props = {
  mode: "view" | "edit" | "create";
  hasOrganization: boolean;
  organization: Organization | null;
  form: FormValues;
  profileCompletion: number;
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

export function ProfileCard({
  mode,
  hasOrganization,
  organization,
  form,
  profileCompletion,
  isSaving,
  onEdit,
  onChange,
  onSubmit,
}: Props) {
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
            <AccountCircleIcon sx={{ color: "#0f172a" }} />
          </Box>
        }
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 800 }}>
            Основні дані бізнесу, які асистент буде використовувати у
            відповідях.
          </Typography>
        }
      />
      <CardContent sx={{ paddingRight: 0, paddingLeft: 0 }}>
        {mode === "view" && hasOrganization && organization ? (
          <ProfileViewContent
            organization={organization as any}
            form={form}
            profileCompletion={profileCompletion}
            onEdit={onEdit}
          />
        ) : (
          <ProfileFormContent
            form={form}
            onChange={onChange}
            onSubmit={onSubmit}
            isSaving={isSaving}
            isEditExisting={hasOrganization}
            profileCompletion={profileCompletion}
          />
        )}
      </CardContent>
    </Card>
  );
}
