"use client";

import {
  Alert,
  Box,
  Paper,
  Snackbar,
  Stack,
  Typography,
  CircularProgress,
} from "@mui/material";
import { DocumentsCard } from "@/components/DocumentsCard/DocumentsCard";
import { useKnowledgeBasePage } from "@/hooksNew/useKnowledgeBasePage";
import { CreateDocumentDialog } from "@/components/CreateDocumentDialog/CreateDocumentDialog";

export function KnowledgeBaseShell() {
  const vm = useKnowledgeBasePage();

  return (
    <>
      <Box sx={styles.shell}>
        {/* ✅ без scroll wrapper */}
        <Stack sx={styles.content} gap={3}>
          {vm.isBootstrapLoading && (
            <Paper sx={styles.bootstrapInfo}>
              <Stack direction="row" spacing={2} alignItems="center">
                <CircularProgress size={20} />
                <Typography variant="body2" sx={{ color: "#4b5563" }}>
                  Готуємо середовище для твоєї бази знань…
                </Typography>
              </Stack>
            </Paper>
          )}

          {vm.bootstrapError && (
            <Paper sx={styles.bootstrapError}>
              <Typography variant="body2" color="#b91c1c">
                Помилка ініціалізації: {vm.bootstrapError.message}
              </Typography>
            </Paper>
          )}

          {/* ✅ важливо: ця обгортка дає DocumentsCard зайняти весь залишок */}
          <Box sx={styles.cardWrap}>
            <DocumentsCard
              organization={vm.organization}
              apiUser={vm.apiUser}
              isBootstrapLoading={vm.isBootstrapLoading}
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
          </Box>
        </Stack>
      </Box>

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
    minHeight: 0, // ✅ must-have для вкладених overflow
  },

  content: {
    flex: 1,
    minHeight: 0, // ✅ must-have
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
