"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Button,
  CircularProgress,
  Paper,
  Stack,
  Typography,
} from "@mui/material";
import { DocumentItem } from "@/components/DocumentItem/DocumentItem";

type Doc = {
  id: string;
  title: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  createdAt: string;
  status: string;
  description?: string | null;
  tags?: string[] | null;
};

type Props = {
  organization: { id: string } | null;
  apiUser: { id: string } | null;
  isBootstrapLoading: boolean;
  isUploading: boolean;

  onOpenCreate: () => void;
  onOpenQuick: () => void;

  documents: Doc[];
  docsLoading: boolean;
  docsError: any;

  search: string;
  setSearch: (v: string) => void;
  searchQuery: string;

  searchResults: any[];
  isSearchLoading: boolean;
  searchError: any;

  onDelete: (id: string) => void;
  isDeleting: boolean;
};

export function DocumentsCard(props: Props) {
  const {
    organization,
    isBootstrapLoading,
    onOpenCreate,
    documents,
    docsLoading,
    docsError,
    onDelete,
    isDeleting,
  } = props;

  return (
    <Paper sx={styles.root}>
      <Stack sx={styles.cardLayout} gap={2}>
        <Stack
          direction={{ xs: "column", md: "row" }}
          justifyContent="space-between"
          alignItems={{ xs: "flex-start", md: "center" }}
          gap={2}
        >
          <Stack spacing={0.5}>
            <Typography variant="h5" sx={styles.h1}>
              Документи бази знань
            </Typography>
            <Typography variant="body2" sx={styles.muted}>
              Додавай актуальні документи, щоб асистент працював з реальними
              матеріалами твого бізнесу.
            </Typography>
          </Stack>

          <Stack direction="row" gap={1} flexWrap="wrap">
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={onOpenCreate}
              disabled={!organization || isBootstrapLoading}
              sx={styles.addBtn}
            >
              Додати документ
            </Button>
          </Stack>
        </Stack>

        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          {docsLoading && <CircularProgress size={18} />}
        </Stack>

        {docsError && (
          <Typography variant="body2" color="#b91c1c">
            Помилка завантаження документів: {docsError.message}
          </Typography>
        )}

        {!docsLoading && documents.length === 0 && (
          <Typography variant="body2" sx={styles.muted}>
            Поки що немає жодного документа. Додай свій перший контракт,
            комерційну пропозицію або FAQ — і асистент зможе ними користуватись.
          </Typography>
        )}

        {/* ✅ СКРОЛИТЬСЯ ЛИШЕ ЦЕЙ БЛОК */}
        {!docsLoading && documents.length > 0 && (
          <Stack sx={styles.itemsScroll} gap={1.5}>
            {documents.map((doc) => (
              <DocumentItem
                key={doc.id}
                doc={doc}
                onDelete={onDelete}
                isDeleting={isDeleting}
              />
            ))}
          </Stack>
        )}
      </Stack>
    </Paper>
  );
}

const styles = {
  root: {
    p: 3,
    borderRadius: 3,
    border: "1px solid #e5e7eb",
    bgcolor: "#ffffff",
    width: "100%",
    height: "100%", // ✅ Paper має займати весь доступний простір
    minHeight: 0, // ✅ must-have
  },

  cardLayout: {
    height: "100%",
    minHeight: 0,
  },

  itemsScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    pr: 0.5,
    pb: 0.5,

    "&::-webkit-scrollbar": { width: 6 },
    "&::-webkit-scrollbar-thumb": {
      borderRadius: 999,
      backgroundColor: "#d1d5db",
    },
    "&::-webkit-scrollbar-track": { backgroundColor: "transparent" },
  },

  h1: { fontWeight: 600, color: "#111827" },
  muted: { color: "#6b7280" },
  sectionTitle: { color: "#111827", fontWeight: 600 },
  addBtn: {
    textTransform: "none",
    borderRadius: 999,
    bgcolor: "#111827",
    boxShadow: "none",
    "&:hover": { bgcolor: "#000000", boxShadow: "none" },
  },
} as const;
