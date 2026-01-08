"use client";

import {
  Alert,
  Box,
  Container,
  Grid,
  Snackbar,
  Typography,
} from "@mui/material";
import { InfinitySpin } from "react-loader-spinner";
import { useOrganizationProfilePage } from "./hooks/useOrganizationProfilePage";
import { PageHeader } from "@/app/organization/components/PageHeader";
import { ProfileCard } from "./components/ProfileCard";
import { CurrentPlanCard } from "@/app/organization/components/CurrentPlanCard";
import { AssistantInfoCard } from "@/app/organization/components/AssistantInfoCard";

export default function OrganizationProfilePage() {
  const vm = useOrganizationProfilePage();

  if (vm.isLoading || !vm.form) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f3f4f6",
        }}
      >
        <InfinitySpin width="200" color="#202124" />
      </Box>
    );
  }

  if (vm.isError) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          display: "grid",
          placeItems: "center",
          bgcolor: "#f3f4f6",
          px: 2,
        }}
      >
        <Typography color="error">
          Не вдалося завантажити дані організації
        </Typography>
      </Box>
    );
  }

  return (
    <>
      <Box
        sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", py: { xs: 2, md: 4 } }}
      >
        <Container maxWidth="lg">
          <PageHeader
            mode={vm.mode}
            profileCompletion={vm.profileCompletion}
            onEdit={vm.actions.toEdit}
            onView={vm.actions.toView}
          />

          {/* 3 окремі сутності (не в одній великій карточці) */}
          <Grid container spacing={2.5}>
            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 8 }}>
              <ProfileCard
                mode={vm.mode}
                hasOrganization={vm.hasOrganization}
                organization={vm.organization}
                form={vm.form}
                profileCompletion={vm.profileCompletion}
                isSaving={vm.isSaving}
                onEdit={vm.actions.toEdit}
                onCancel={vm.actions.cancelEdit}
                onChange={vm.actions.onChange}
                onSubmit={vm.actions.onSubmit}
              />
            </Grid>

            <Grid size={{ xs: 12, sm: 12, md: 12, lg: 4 }}>
              <Box sx={{ display: "flex", flexDirection: "column", gap: 2.5 }}>
                <CurrentPlanCard planName={vm.currentPlanName} />
                <AssistantInfoCard />
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Snackbar
        open={vm.snackbar.open}
        autoHideDuration={3000}
        onClose={vm.actions.closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert
          severity={vm.snackbar.severity}
          onClose={vm.actions.closeSnackbar}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {vm.snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}
