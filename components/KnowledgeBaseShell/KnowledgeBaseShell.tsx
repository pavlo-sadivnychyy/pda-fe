"use client";

import Link from "next/link";
import {
  Alert,
  Box,
  Button,
  Paper,
  Snackbar,
  Stack,
  Typography,
  CircularProgress,
  Card,
  CardContent,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

import { DocumentsCard } from "@/components/DocumentsCard/DocumentsCard";
import { useKnowledgeBasePage } from "@/hooksNew/useKnowledgeBasePage";
import { CreateDocumentDialog } from "@/components/CreateDocumentDialog/CreateDocumentDialog";

function KnowledgeBaseNoOrgState() {
  return (
    <Box sx={{ flex: 1, display: "grid", placeItems: "center", minHeight: 0 }}>
      <Card
        sx={{
          width: "100%",
          maxWidth: 640,
          borderRadius: 4,
          border: "1px solid rgba(0,0,0,0.08)",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)",
        }}
      >
        <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
          <Stack spacing={2.2} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 999,
                display: "grid",
                placeItems: "center",
                bgcolor: "rgba(25,118,210,0.08)",
              }}
            >
              <BusinessIcon />
            </Box>

            <Typography variant="h5" sx={{ fontWeight: 800 }}>
              Спочатку створи організацію
            </Typography>

            <Typography variant="body1" sx={{ color: "text.secondary" }}>
              Документи прив’язані до організації. Створи її — і тоді зможеш
              завантажувати файли, шукати по базі знань та керувати документами.
            </Typography>

            <Button
              component={Link}
              href="/organization"
              variant="contained"
              endIcon={<ArrowForwardIcon />}
              sx={{ borderRadius: 999, px: 2.5 }}
            >
              Перейти до створення
            </Button>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
}

export function KnowledgeBaseShell() {
  const vm = useKnowledgeBasePage();

  const shouldShowNoOrg = !vm.isGateLoading && !vm.bootstrapError && !vm.hasOrg;

  return (
    <>
      <Box sx={styles.shell}>
        <Stack sx={styles.content} gap={3}>
          {vm.isGateLoading && (
            <Paper sx={styles.bootstrapInfo}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                  Готуємо середовище для твоєї бази знань…
                </Typography>
              </Stack>
            </Paper>
          )}

          {(vm.bootstrapError || vm.userDataError) && (
            <Paper sx={styles.bootstrapError}>
              <Typography variant="body2" color="#b91c1c">
                Помилка ініціалізації:{" "}
                {(vm.bootstrapError as any)?.message ||
                  (vm.userDataError as any)?.message}
              </Typography>
            </Paper>
          )}

          <Box sx={styles.cardWrap}>
            {shouldShowNoOrg ? (
              <KnowledgeBaseNoOrgState />
            ) : (
              <DocumentsCard
                organization={vm.organization}
                apiUser={vm.apiUser}
                isBootstrapLoading={vm.isGateLoading}
                isUploading={vm.isUploading}
                onOpenCreate={vm.openDialog}
                onOpenQuick={vm.openQuickPicker}
                documents={vm.documents}
                docsLoading={vm.docsLoading}
                docsError={vm.docsError}
                search={vm.search}
                setSearch={vm.setSearch}
                searchQuery={vm.searchQuery}
                searchResults={vm.searchResults}
                isSearchLoading={vm.isSearchLoading}
                searchError={vm.searchError}
                onDelete={vm.handleDelete}
                isDeleting={vm.isDeleting}
              />
            )}
          </Box>
        </Stack>
      </Box>

      {/* ✅ keep inputs mounted; safe even if no org (handlers early-return) */}
      <input
        ref={vm.quickInputRef}
        type="file"
        hidden
        multiple
        accept=".pdf,.doc,.docx,.txt"
        onChange={vm.onQuickFilesSelected}
      />

      <CreateDocumentDialog
        open={vm.isDialogOpen}
        onClose={vm.closeDialog}
        onCreate={vm.handleCreate}
        disabled={!vm.organization || !vm.apiUser}
        isUploading={vm.isUploading}
        title={vm.title}
        setTitle={vm.setTitle}
        description={vm.description}
        setDescription={vm.setDescription}
        tags={vm.tags}
        setTags={vm.setTags}
        file={vm.file}
        inputRef={vm.dialogInputRef}
        onPickFile={vm.openDialogPicker}
        onFileChange={vm.onDialogFileChange}
        uploadError={vm.uploadError?.message}
      />

      <Snackbar
        open={vm.snackbar.open}
        autoHideDuration={4000}
        onClose={vm.closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "right" }}
      >
        <Alert
          severity={vm.snackbar.severity}
          onClose={vm.closeSnackbar}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {vm.snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

const styles = {
  shell: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    minHeight: 0,
  },

  content: {
    flex: 1,
    minHeight: 0,
  },

  cardWrap: {
    flex: 1,
    minHeight: 0,
    display: "flex",
  },

  bootstrapInfo: {
    p: 2,
    borderRadius: 3,
    border: "1px solid #e5e7eb",
    bgcolor: "#f9fafb",
  },
  bootstrapError: {
    p: 2,
    borderRadius: 3,
    border: "1px solid #fecaca",
    bgcolor: "#fef2f2",
  },
} as const;
