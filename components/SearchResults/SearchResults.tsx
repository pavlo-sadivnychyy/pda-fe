"use client";

import DescriptionIcon from "@mui/icons-material/Description";
import { Box, CircularProgress, Paper, Stack, Typography } from "@mui/material";
import { makeSnippet } from "@/app/knowledge-base/formatters";

type Props = {
  query: string;
  isLoading: boolean;
  error: any;
  results: Array<{
    id: string;
    chunkIndex: number;
    content: string;
    document: { title: string; originalName: string };
  }>;
};

export function SearchResults({ query, isLoading, error, results }: Props) {
  return (
    <>
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={1}
      >
        <Typography
          variant="subtitle2"
          sx={{ color: "#111827", fontWeight: 500 }}
        >
          Результати пошуку для “{query}”
        </Typography>
        {isLoading && <CircularProgress size={18} />}
      </Stack>

      {error && (
        <Typography variant="body2" sx={{ color: "#b91c1c" }}>
          Помилка пошуку: {error.message}
        </Typography>
      )}

      {!isLoading && results.length === 0 && (
        <Typography variant="body2" sx={{ color: "#6b7280" }}>
          Нічого не знайдено.
        </Typography>
      )}

      {!isLoading && results.length > 0 && (
        <Stack gap={1.5}>
          {results.map((res) => (
            <Paper key={res.id} variant="outlined" sx={styles.item}>
              <Stack direction="row" gap={1.5} alignItems="flex-start">
                <DescriptionIcon sx={{ color: "#4b5563", mt: 0.3 }} />
                <Box>
                  <Typography
                    variant="body2"
                    sx={{ color: "#111827", fontWeight: 500 }}
                  >
                    {res.document.title}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#9ca3af", display: "block", mb: 0.5 }}
                  >
                    {res.document.originalName} · фрагмент #{res.chunkIndex + 1}
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      color: "#4b5563",
                      fontSize: 13,
                      whiteSpace: "pre-wrap",
                    }}
                  >
                    {makeSnippet(res.content, query)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          ))}
        </Stack>
      )}
    </>
  );
}

const styles = {
  item: { p: 1.5, borderRadius: 2, borderColor: "#e5e7eb", bgcolor: "#f9fafb" },
} as const;
