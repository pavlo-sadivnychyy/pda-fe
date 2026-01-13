"use client";

import AddIcon from "@mui/icons-material/Add";
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { SearchResults } from "@/components/SearchResults/SearchResults";
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
    search,
    setSearch,
    searchQuery,
    searchResults,
    isSearchLoading,
    searchError,
    onDelete,
    isDeleting,
  } = props;

  return (
    <Paper sx={styles.root}>
      <Stack gap={2}>
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
          <Typography variant="subtitle1" sx={styles.sectionTitle}>
            Документи
          </Typography>
          {docsLoading && <CircularProgress size={18} />}
        </Stack>

        <TextField
          size="small"
          fullWidth
          placeholder="Пошук по базі знань"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          InputProps={{ sx: { bgcolor: "#f9fafb" } }}
        />

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

        {!docsLoading && documents.length > 0 && (
          <Stack gap={1.5}>
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

        {searchQuery && (
          <Box mt={2}>
            <SearchResults
              query={searchQuery}
              isLoading={isSearchLoading}
              error={searchError}
              results={searchResults}
            />
          </Box>
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
