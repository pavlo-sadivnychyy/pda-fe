"use client";

import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  CardHeader,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
  Snackbar,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import DescriptionIcon from "@mui/icons-material/Description";
import AddIcon from "@mui/icons-material/Add";
import { ChangeEvent, useEffect, useState } from "react";

import { useKnowledgeBaseBootstrap } from "@/hooks/useKnowledgeBaseBootstrap";
import {
  useDeleteKnowledgeBaseDocument,
  useKnowledgeBaseDocuments,
  useUploadKnowledgeBaseDocument,
} from "@/hooks/useKnowledgeBaseDocuments";
import { useKnowledgeBaseSearch } from "@/hooks/useKnowledgeBaseSearch";

export default function KnowledgeBasePage() {
  // 1) Усі хуки — завжди, у фіксованому порядку
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => {
    setHasMounted(true);
  }, []);

  const {
    clerkUser,
    data: bootstrapData,
    isLoading: isBootstrapLoading,
    error: bootstrapError,
  } = useKnowledgeBaseBootstrap();

  const organization = bootstrapData?.organization ?? null;
  const apiUser = bootstrapData?.apiUser ?? null;

  const {
    data: docsData,
    isLoading: docsLoading,
    error: docsError,
  } = useKnowledgeBaseDocuments(organization?.id);
  const documents = docsData?.items ?? [];

  const {
    mutate: uploadDocument,
    isPending: isUploading,
    error: uploadError,
  } = useUploadKnowledgeBaseDocument();

  const { mutate: deleteDocument, isPending: isDeleting } =
    useDeleteKnowledgeBaseDocument();

  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");
  useEffect(() => {
    const id = setTimeout(() => {
      setSearchQuery(search.trim());
    }, 400);
    return () => clearTimeout(id);
  }, [search]);

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useKnowledgeBaseSearch(organization?.id, searchQuery);
  const searchResults = searchData?.items ?? [];

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({
    open: false,
    message: "",
    severity: "success",
  });

  const handleCloseSnackbar = () => {
    setSnackbar((prev) => ({ ...prev, open: false }));
  };

  const handleOpenDialog = () => setIsDialogOpen(true);
  const handleCloseDialog = () => {
    if (isUploading) return;
    setIsDialogOpen(false);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
  };

  const handleCreate = () => {
    if (!organization || !apiUser || !file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organization.id);
    formData.append("createdById", apiUser.id);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    formData.append("language", "uk");

    uploadDocument(
      {
        organizationId: organization.id,
        formData,
      },
      {
        onSuccess: () => {
          setTitle("");
          setDescription("");
          setTags("");
          setFile(null);
          setIsDialogOpen(false);
          setSnackbar({
            open: true,
            message: "Документ додано до бази знань",
            severity: "success",
          });
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message:
              error?.response?.data?.message ||
              "Не вдалося завантажити документ",
            severity: "error",
          });
        },
      },
    );
  };

  const handleDelete = (id: string) => {
    if (!organization) return;
    deleteDocument(
      { id, organizationId: organization.id },
      {
        onSuccess: () => {
          setSnackbar({
            open: true,
            message: "Документ видалено",
            severity: "success",
          });
        },
        onError: (error: any) => {
          setSnackbar({
            open: true,
            message:
              error?.response?.data?.message || "Не вдалося видалити документ",
            severity: "error",
          });
        },
      },
    );
  };

  // 2) Тепер безпечно: усі хуки вже викликані
  if (!hasMounted) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          height: "100vh",
          bgcolor: "#f3f4f6",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          px: 2,
          py: 2,
          overflow: "hidden", // сторінка не скролиться
        }}
      >
        <Card
          elevation={4}
          sx={{
            width: "100%",
            maxWidth: 1400,
            borderRadius: 4,
            boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
            overflow: "hidden",
            display: "flex",
            flexDirection: "column",
            maxHeight: "100%",
          }}
        >
          {/* Header в стилі профілю організації */}
          <CardHeader
            sx={{
              px: { xs: 3, md: 4 },
              pt: { xs: 3, md: 4 },
              pb: 1,
            }}
            title={
              <Stack spacing={1}>
                <Chip
                  label="Knowledge base"
                  size="small"
                  sx={{
                    alignSelf: "flex-start",
                    borderRadius: 999,
                    bgcolor: "#f3f4f6",
                    color: "#6b7280",
                    fontWeight: 500,
                    fontSize: 11,
                    textTransform: "uppercase",
                    letterSpacing: 0.5,
                  }}
                />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 600,
                    color: "#111827",
                  }}
                >
                  База знань
                </Typography>
                <Typography
                  variant="body2"
                  sx={{
                    color: "#6b7280",
                    maxWidth: "100%",
                  }}
                >
                  Додавай договори, політики, FAQ та інші матеріали — асистент
                  буде опиратися на них при генерації відповідей.
                </Typography>
              </Stack>
            }
          />

          <CardContent
            sx={{
              px: { xs: 3, md: 4 },
              pb: 3,
              pt: 0,
              flex: 1,
              display: "flex",
              flexDirection: "column",
              overflow: "hidden", // контролюємо скрол всередині
            }}
          >
            <SignedOut>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <Typography color="#6b7280">
                  Щоб побачити базу знань, спочатку увійди в акаунт.
                </Typography>
              </Box>
            </SignedOut>

            <SignedIn>
              <Box
                sx={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  overflow: "hidden",
                }}
              >
                {/* Весь скрол всередині цього бокса */}
                <Box
                  sx={{
                    flex: 1,
                    overflowY: "auto",
                    pr: 1,
                    pb: 1,
                    "&::-webkit-scrollbar": {
                      width: 6,
                    },
                    "&::-webkit-scrollbar-thumb": {
                      borderRadius: 999,
                      backgroundColor: "#d1d5db",
                    },
                    "&::-webkit-scrollbar-track": {
                      backgroundColor: "transparent",
                    },
                  }}
                >
                  <Stack gap={3}>
                    {/* Header + кнопка додати документ */}
                    <Stack
                      direction={{ xs: "column", md: "row" }}
                      justifyContent="space-between"
                      alignItems={{ xs: "flex-start", md: "center" }}
                      gap={2}
                    >
                      <Stack spacing={0.5}>
                        <Typography
                          variant="h5"
                          sx={{ fontWeight: 600, color: "#111827" }}
                        >
                          Документи бази знань
                        </Typography>
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          Додавай актуальні документи, щоб асистент працював з
                          реальними матеріалами твого бізнесу.
                        </Typography>
                      </Stack>

                      <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenDialog}
                        disabled={!organization || isBootstrapLoading}
                        sx={{
                          textTransform: "none",
                          borderRadius: 999,
                          bgcolor: "#111827",
                          boxShadow: "none",
                          "&:hover": {
                            bgcolor: "#000000",
                            boxShadow: "none",
                          },
                        }}
                      >
                        Додати документ
                      </Button>
                    </Stack>

                    {/* Bootstrap loading / error */}
                    {isBootstrapLoading && (
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid #e5e7eb",
                          bgcolor: "#f9fafb",
                        }}
                      >
                        <Stack direction="row" spacing={2} alignItems="center">
                          <CircularProgress size={20} />
                          <Typography variant="body2" sx={{ color: "#4b5563" }}>
                            Готуємо середовище для твоєї бази знань…
                          </Typography>
                        </Stack>
                      </Paper>
                    )}

                    {bootstrapError && (
                      <Paper
                        sx={{
                          p: 2,
                          borderRadius: 3,
                          border: "1px solid #fecaca",
                          bgcolor: "#fef2f2",
                        }}
                      >
                        <Typography variant="body2" color="#b91c1c">
                          Помилка ініціалізації: {bootstrapError.message}
                        </Typography>
                      </Paper>
                    )}

                    {/* Info about org */}
                    {organization && (
                      <Paper
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          border: "1px solid #e5e7eb",
                          bgcolor: "#ffffff",
                        }}
                      >
                        <Stack
                          direction={{ xs: "column", md: "row" }}
                          justifyContent="space-between"
                          gap={2}
                        >
                          <Stack gap={0.5}>
                            <Typography
                              variant="overline"
                              sx={{
                                color: "#9ca3af",
                                letterSpacing: 1,
                              }}
                            >
                              БІЗНЕС
                            </Typography>
                            <Typography
                              variant="subtitle1"
                              sx={{ color: "#111827", fontWeight: 600 }}
                            >
                              {organization.name}
                            </Typography>
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              Документи цієї бази знань привʼязані саме до цього
                              бізнес-акаунта.
                            </Typography>
                          </Stack>
                          <Stack
                            alignItems={{
                              xs: "flex-start",
                              md: "flex-end",
                            }}
                            gap={1}
                          >
                            {organization.slug && (
                              <Chip
                                size="small"
                                label={`slug: ${organization.slug}`}
                                variant="outlined"
                                sx={{
                                  borderColor: "#e5e7eb",
                                  color: "#6b7280",
                                  fontSize: 11,
                                }}
                              />
                            )}
                            {clerkUser?.emailAddresses?.[0]?.emailAddress && (
                              <Typography
                                variant="caption"
                                sx={{ color: "#9ca3af" }}
                              >
                                Власник:{" "}
                                {clerkUser.emailAddresses[0].emailAddress}
                              </Typography>
                            )}
                          </Stack>
                        </Stack>
                      </Paper>
                    )}

                    {/* Documents + search */}
                    <Paper
                      sx={{
                        p: 3,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                        bgcolor: "#ffffff",
                      }}
                    >
                      <Stack gap={2}>
                        <Stack
                          direction="row"
                          justifyContent="space-between"
                          alignItems="center"
                        >
                          <Typography
                            variant="subtitle1"
                            sx={{ color: "#111827", fontWeight: 600 }}
                          >
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
                          InputProps={{
                            sx: {
                              bgcolor: "#f9fafb",
                            },
                          }}
                        />

                        {docsError && (
                          <Typography variant="body2" color="#b91c1c">
                            Помилка завантаження документів: {docsError.message}
                          </Typography>
                        )}

                        {!docsLoading && documents.length === 0 && (
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            Поки що немає жодного документа. Додай свій перший
                            контракт, комерційну пропозицію або FAQ — і асистент
                            зможе ними користуватись.
                          </Typography>
                        )}

                        {!docsLoading && documents.length > 0 && (
                          <Stack gap={1.5}>
                            {documents.map((doc) => (
                              <Paper
                                key={doc.id}
                                variant="outlined"
                                sx={{
                                  p: 1.5,
                                  borderRadius: 2,
                                  borderColor: "#e5e7eb",
                                  bgcolor: "#f9fafb",
                                }}
                              >
                                <Stack
                                  direction={{ xs: "column", md: "row" }}
                                  justifyContent="space-between"
                                  alignItems={{
                                    xs: "flex-start",
                                    md: "center",
                                  }}
                                  gap={1}
                                >
                                  <Stack
                                    direction="row"
                                    gap={1.5}
                                    alignItems="center"
                                  >
                                    <DescriptionIcon
                                      sx={{ color: "#4b5563" }}
                                    />
                                    <Stack>
                                      <Typography
                                        variant="body1"
                                        sx={{
                                          color: "#111827",
                                          fontWeight: 500,
                                        }}
                                      >
                                        {doc.title}
                                      </Typography>
                                      <Typography
                                        variant="caption"
                                        sx={{ color: "#9ca3af" }}
                                      >
                                        {doc.originalName} · {doc.mimeType}
                                      </Typography>
                                    </Stack>
                                  </Stack>

                                  <Stack
                                    direction="row"
                                    gap={1}
                                    alignItems="center"
                                    flexWrap="wrap"
                                  >
                                    <Chip
                                      size="small"
                                      label={formatStatus(doc.status)}
                                      sx={{
                                        bgcolor: getStatusColor(doc.status),
                                        color: "#0f172a",
                                        fontSize: 11,
                                      }}
                                    />
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#6b7280",
                                        minWidth: 140,
                                      }}
                                    >
                                      Розмір: {formatSize(doc.sizeBytes)}
                                    </Typography>
                                    <Typography
                                      variant="caption"
                                      sx={{
                                        color: "#6b7280",
                                        minWidth: 180,
                                      }}
                                    >
                                      Додано: {formatDateStable(doc.createdAt)}
                                    </Typography>

                                    <Tooltip title="Видалити документ">
                                      <span>
                                        <IconButton
                                          size="small"
                                          onClick={() => handleDelete(doc.id)}
                                          disabled={isDeleting}
                                        >
                                          <DeleteIcon fontSize="small" />
                                        </IconButton>
                                      </span>
                                    </Tooltip>
                                  </Stack>
                                </Stack>

                                {doc.description && (
                                  <Box mt={1}>
                                    <Typography
                                      variant="body2"
                                      sx={{
                                        color: "#4b5563",
                                        fontSize: 13,
                                      }}
                                    >
                                      {doc.description}
                                    </Typography>
                                  </Box>
                                )}

                                {doc.tags && doc.tags.length > 0 && (
                                  <Stack
                                    direction="row"
                                    gap={0.5}
                                    mt={1}
                                    flexWrap="wrap"
                                  >
                                    {doc.tags.map((tag) => (
                                      <Chip
                                        key={tag}
                                        size="small"
                                        label={tag}
                                        variant="outlined"
                                        sx={{
                                          borderColor: "#e5e7eb",
                                          color: "#6b7280",
                                          fontSize: 11,
                                        }}
                                      />
                                    ))}
                                  </Stack>
                                )}
                              </Paper>
                            ))}
                          </Stack>
                        )}

                        {/* Search results */}
                        {searchQuery && (
                          <Box mt={2}>
                            <Stack
                              direction="row"
                              justifyContent="space-between"
                              alignItems="center"
                              mb={1}
                            >
                              <Typography
                                variant="subtitle2"
                                sx={{
                                  color: "#111827",
                                  fontWeight: 500,
                                }}
                              >
                                Результати пошуку для “{searchQuery}”
                              </Typography>
                              {isSearchLoading && (
                                <CircularProgress size={18} />
                              )}
                            </Stack>

                            {searchError && (
                              <Typography
                                variant="body2"
                                sx={{ color: "#b91c1c" }}
                              >
                                Помилка пошуку: {searchError.message}
                              </Typography>
                            )}

                            {!isSearchLoading && searchResults.length === 0 && (
                              <Typography
                                variant="body2"
                                sx={{ color: "#6b7280" }}
                              >
                                Нічого не знайдено.
                              </Typography>
                            )}

                            {!isSearchLoading && searchResults.length > 0 && (
                              <Stack gap={1.5}>
                                {searchResults.map((res) => (
                                  <Paper
                                    key={res.id}
                                    variant="outlined"
                                    sx={{
                                      p: 1.5,
                                      borderRadius: 2,
                                      borderColor: "#e5e7eb",
                                      bgcolor: "#f9fafb",
                                    }}
                                  >
                                    <Stack
                                      direction="row"
                                      gap={1.5}
                                      alignItems="flex-start"
                                    >
                                      <DescriptionIcon
                                        sx={{
                                          color: "#4b5563",
                                          mt: 0.3,
                                        }}
                                      />
                                      <Box>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "#111827",
                                            fontWeight: 500,
                                          }}
                                        >
                                          {res.document.title}
                                        </Typography>
                                        <Typography
                                          variant="caption"
                                          sx={{
                                            color: "#9ca3af",
                                            display: "block",
                                            mb: 0.5,
                                          }}
                                        >
                                          {res.document.originalName} · фрагмент
                                          #{res.chunkIndex + 1}
                                        </Typography>
                                        <Typography
                                          variant="body2"
                                          sx={{
                                            color: "#4b5563",
                                            fontSize: 13,
                                            whiteSpace: "pre-wrap",
                                          }}
                                        >
                                          {makeSnippet(
                                            res.content,
                                            searchQuery,
                                          )}
                                        </Typography>
                                      </Box>
                                    </Stack>
                                  </Paper>
                                ))}
                              </Stack>
                            )}
                          </Box>
                        )}
                      </Stack>
                    </Paper>
                  </Stack>
                </Box>
              </Box>
            </SignedIn>
          </CardContent>
        </Card>
      </Box>

      {/* Dialog create document – стилізація як форма організації */}
      <Dialog
        open={isDialogOpen}
        onClose={handleCloseDialog}
        fullWidth
        maxWidth="sm"
        PaperProps={{
          sx: {
            borderRadius: 4,
          },
        }}
      >
        <DialogTitle
          sx={{
            px: 3,
            pt: 3,
            pb: 1,
          }}
        >
          <Stack spacing={1}>
            <Chip
              label="Knowledge base"
              size="small"
              sx={{
                alignSelf: "flex-start",
                borderRadius: 999,
                bgcolor: "#f3f4f6",
                color: "#6b7280",
                fontWeight: 500,
                fontSize: 11,
                textTransform: "uppercase",
                letterSpacing: 0.5,
              }}
            />
            <Typography
              variant="h6"
              sx={{
                fontWeight: 600,
                color: "#111827",
              }}
            >
              Додати документ
            </Typography>
            <Typography
              variant="body2"
              sx={{
                color: "#6b7280",
              }}
            >
              Завантаж документ, додай назву, опис та теги — асистент буде
              використовувати його для відповідей.
            </Typography>
          </Stack>
        </DialogTitle>

        <DialogContent
          sx={{
            pt: 2,
            px: 3,
            pb: 1,
          }}
        >
          <Stack spacing={2.5} sx={{ paddingTop: "5px" }}>
            <TextField
              label="Назва документа"
              fullWidth
              size="small"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Наприклад: Договір з клієнтом (шаблон)"
              InputLabelProps={{ shrink: true }}
            />

            <Button
              variant="outlined"
              component="label"
              fullWidth
              sx={{
                justifyContent: "flex-start",
                borderRadius: 2,
                borderColor: "#e5e7eb",
                bgcolor: "#f9fafb",
                textTransform: "none",
                fontSize: 14,
                "&:hover": {
                  borderColor: "#d1d5db",
                  bgcolor: "#f3f4f6",
                },
              }}
            >
              <Stack
                direction="row"
                spacing={1.5}
                alignItems="center"
                sx={{ width: "100%" }}
              >
                <DescriptionIcon sx={{ color: "#6b7280" }} />
                <Box sx={{ flex: 1 }}>
                  <Typography
                    variant="body2"
                    sx={{ color: "#111827", fontWeight: 500 }}
                  >
                    {file ? file.name : "Обрати файл"}
                  </Typography>
                  <Typography
                    variant="caption"
                    sx={{ color: "#9ca3af", fontSize: 11 }}
                  >
                    Підтримуються PDF, DOCX та інші текстові формати
                  </Typography>
                </Box>
              </Stack>
              <input type="file" hidden onChange={handleFileChange} />
            </Button>

            <TextField
              label="Опис"
              fullWidth
              size="small"
              multiline
              minRows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Наприклад: Основний шаблон договору з клієнтами"
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Теги (через кому)"
              fullWidth
              size="small"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              placeholder="contract, legal, offer"
              InputLabelProps={{ shrink: true }}
            />

            {uploadError && (
              <Typography variant="body2" color="#b91c1c">
                Помилка завантаження: {uploadError.message}
              </Typography>
            )}
          </Stack>
        </DialogContent>

        <DialogActions
          sx={{
            px: 3,
            pb: 3,
            pt: 1,
            borderTop: "1px solid #e5e7eb",
            display: "flex",
            justifyContent: "space-between",
            gap: 1.5,
          }}
        >
          <Button
            onClick={handleCloseDialog}
            disabled={isUploading}
            sx={{
              textTransform: "none",
              borderRadius: 999,
            }}
          >
            Скасувати
          </Button>
          <Button
            onClick={handleCreate}
            variant="contained"
            disabled={!organization || !apiUser || !file || isUploading}
            sx={{
              textTransform: "none",
              borderRadius: 999,
              bgcolor: "#111827",
              boxShadow: "none",
              "&:hover": {
                bgcolor: "#000000",
                boxShadow: "none",
              },
            }}
          >
            {isUploading ? (
              <Stack direction="row" alignItems="center" gap={1}>
                <CircularProgress size={16} />
                <span>Завантажуємо…</span>
              </Stack>
            ) : (
              "Додати документ"
            )}
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          severity={snackbar.severity}
          onClose={handleCloseSnackbar}
          variant="filled"
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

// === Helpers ===

function formatSize(bytes: number) {
  if (!bytes || bytes <= 0) return "0 B";
  if (bytes < 1024) return `${bytes} B`;
  const kb = bytes / 1024;
  if (kb < 1024) return `${kb.toFixed(1)} KB`;
  const mb = kb / 1024;
  if (mb < 1024) return `${mb.toFixed(1)} MB`;
  const gb = mb / 1024;
  return `${gb.toFixed(1)} GB`;
}

function formatStatus(status: string) {
  switch (status) {
    case "READY":
      return "Готовий";
    case "PROCESSING":
      return "Обробка";
    case "FAILED":
      return "Помилка";
    default:
      return status;
  }
}

function formatDateStable(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const iso = d.toISOString();
  return iso.slice(0, 16).replace("T", " ");
}

function getStatusColor(status: string) {
  switch (status) {
    case "READY":
      return "#bbf7d0";
    case "PROCESSING":
      return "#fef3c7";
    case "FAILED":
      return "#fee2e2";
    default:
      return "#e5e7eb";
  }
}

function makeSnippet(text: string, query: string, max = 200) {
  if (!text) return "";
  const lower = text.toLowerCase();
  const q = query.toLowerCase();
  const idx = lower.indexOf(q);

  if (idx === -1) {
    return text.length > max ? text.slice(0, max) + "…" : text;
  }

  const start = Math.max(0, idx - 40);
  const end = Math.min(text.length, idx + q.length + 40);
  const slice = text.slice(start, end);

  return (start > 0 ? "…" : "") + slice + (end < text.length ? "…" : "");
}
