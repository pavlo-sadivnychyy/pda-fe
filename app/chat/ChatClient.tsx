"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { SignedIn, SignedOut } from "@clerk/nextjs";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  Container,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  IconButton,
  List,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import AddIcon from "@mui/icons-material/Add";
import SmartToyIcon from "@mui/icons-material/SmartToy";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { useRouter, useSearchParams } from "next/navigation";

import { useKnowledgeBaseBootstrap } from "@/hooks/useKnowledgeBaseBootstrap";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useChatSession } from "@/hooks/useChatSession";
import { useCreateChatSession } from "@/hooks/useCreateChatSession";
import { useSendChatMessage } from "@/hooks/useSendChatMessage";
import { useDeleteChatSession } from "@/hooksNew/useDeleteChatSession";
import { useQueryClient } from "@tanstack/react-query";

function formatDateStable(dateStr: string) {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return "";
  const iso = d.toISOString();
  return iso.slice(0, 16).replace("T", " ");
}

function decodeSearchParam(value: string | null) {
  if (!value) return "";
  try {
    return decodeURIComponent(value);
  } catch {
    return value;
  }
}

export default function ChatClient() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const router = useRouter();
  const searchParams = useSearchParams();

  const prefillParam = decodeSearchParam(searchParams.get("prefill"));
  const shouldCreateNew = searchParams.get("new") === "1";

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const didHandleDeepLinkRef = useRef(false);

  const {
    clerkUser,
    data: bootstrapData,
    isLoading: isBootstrapLoading,
    error: bootstrapError,
  } = useKnowledgeBaseBootstrap();

  const organization = bootstrapData?.organization ?? null;
  const apiUser = bootstrapData?.apiUser ?? null;

  const {
    data: sessionsData,
    isLoading: isSessionsLoading,
    error: sessionsError,
  } = useChatSessions(organization?.id, apiUser?.id);

  const sessions = sessionsData?.items ?? [];

  const [selectedSessionId, setSelectedSessionId] = useState<
    string | undefined
  >(undefined);

  // ✅ FIX: коли сесій 0 — скинути selectedSessionId, щоб не було /undefined або старого id
  // ✅ FIX: коли сесії зʼявились — вибрати першу
  useEffect(() => {
    if (sessions.length === 0) {
      if (selectedSessionId !== undefined) setSelectedSessionId(undefined);
      return;
    }
    if (!selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  // ✅ FIX: useChatSession тепер safe, але ми ще й тут передаємо тільки валідні значення
  const { data: sessionData, isLoading: isSessionLoading } = useChatSession(
    selectedSessionId,
    apiUser?.id,
  );

  const queryClient = useQueryClient();

  const messages = sessionData?.session?.messages ?? [];

  const createSessionMutation = useCreateChatSession();
  const sendMessageMutation = useSendChatMessage(organization?.id);
  const deleteSessionMutation = useDeleteChatSession();

  const [draft, setDraft] = useState("");

  // delete confirm dialog state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [pendingDeleteSessionId, setPendingDeleteSessionId] = useState<
    string | null
  >(null);

  const handleCreateSession = (title?: string) => {
    if (!organization || !apiUser) return;

    createSessionMutation.mutate(
      {
        organizationId: organization.id,
        createdById: apiUser.id,
        title: title?.trim() ? title : "Новий діалог",
      },
      {
        onSuccess: (data) => {
          setSelectedSessionId(data.session.id);
        },
      },
    );
  };

  // ✅ Deep-link логіка: /chat?new=1&prefill=...
  useEffect(() => {
    if (!hasMounted) return;
    if (didHandleDeepLinkRef.current) return;

    // потрібні дані для створення сесії
    if (!organization || !apiUser) return;

    const hasAction = shouldCreateNew || !!prefillParam;
    if (!hasAction) return;

    didHandleDeepLinkRef.current = true;

    // 1) заповнюємо інпут одразу
    if (prefillParam) {
      setDraft(prefillParam);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    // 2) якщо треба — створюємо новий діалог
    if (shouldCreateNew) {
      const smartTitle = prefillParam?.slice(0, 44)?.trim() || "Новий діалог";

      createSessionMutation.mutate(
        {
          organizationId: organization.id,
          createdById: apiUser.id,
          title: smartTitle,
        },
        {
          onSuccess: (data) => {
            setSelectedSessionId(data.session.id);
            setTimeout(() => inputRef.current?.focus(), 50);
            router.replace("/chat");
          },
          onError: () => {
            router.replace("/chat");
          },
        },
      );
      return;
    }

    router.replace("/chat");
  }, [
    hasMounted,
    organization,
    apiUser,
    shouldCreateNew,
    prefillParam,
    router,
    createSessionMutation,
  ]);

  const handleSend = () => {
    if (
      !draft.trim() ||
      !selectedSessionId ||
      !apiUser ||
      sendMessageMutation.isPending
    )
      return;

    const content = draft.trim();
    setDraft("");

    sendMessageMutation.mutate({
      sessionId: selectedSessionId,
      userId: apiUser.id,
      content,
    });
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const isSending = sendMessageMutation.isPending;

  const selectedSessionTitle = useMemo(() => {
    if (!selectedSessionId) return "";
    const s = sessions.find((x) => x.id === selectedSessionId);
    return s?.title ?? "";
  }, [sessions, selectedSessionId]);

  const openDeleteConfirm = (sessionId: string) => {
    setPendingDeleteSessionId(sessionId);
    setDeleteDialogOpen(true);
  };

  const closeDeleteConfirm = () => {
    if (deleteSessionMutation.isPending) return;
    setDeleteDialogOpen(false);
    setPendingDeleteSessionId(null);
  };

  const confirmDelete = () => {
    if (!pendingDeleteSessionId || !apiUser) return;

    const deletingId = pendingDeleteSessionId;

    const idx = sessions.findIndex((s) => s.id === deletingId);
    const nextCandidate =
      idx >= 0
        ? (sessions[idx + 1]?.id ?? sessions[idx - 1]?.id ?? undefined)
        : undefined;

    deleteSessionMutation.mutate(
      { sessionId: deletingId, userId: apiUser.id },
      {
        onSuccess: () => {
          setDeleteDialogOpen(false);
          setPendingDeleteSessionId(null);

          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
          if (selectedSessionId === deletingId) {
            setSelectedSessionId(nextCandidate);
          }
        },
      },
    );
  };

  if (!hasMounted) return null;

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f3f4f6", padding: "32px 0" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            Повернутись назад
          </Button>

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1}
            alignItems={{ xs: "flex-start", sm: "center" }}
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Box
                sx={{
                  width: 38,
                  height: 38,
                  borderRadius: "999px",
                  bgcolor: "#ffffff",
                  border: "1px solid #e2e8f0",
                  display: "grid",
                  placeItems: "center",
                }}
              >
                <SmartToyIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                AI-асистент
              </Typography>
            </Stack>

            <Chip
              label="AI assistant"
              size="small"
              sx={{
                bgcolor: "#ffffff",
                border: "1px solid #e2e8f0",
                color: "#0f172a",
                fontWeight: 700,
              }}
            />
          </Stack>

          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.8 }}>
            Асистент знає твій бізнес-профіль і документи з бази знань, щоб
            відповідати в контексті саме твого бізнесу.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
            bgcolor: "#ffffff",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            minHeight: { xs: "calc(100vh - 220px)", md: "72vh" },
          }}
        >
          <SignedOut>
            <Box sx={{ flex: 1, display: "grid", placeItems: "center", px: 2 }}>
              <Typography color="#6b7280">
                Щоб користуватись AI-чатом, спочатку увійди в акаунт.
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
              <Box
                sx={{
                  flex: 1,
                  overflowY: "auto",
                  pr: 1,
                  pb: 1,
                  "&::-webkit-scrollbar": { width: 6 },
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
                        Діалоги з асистентом
                      </Typography>
                    </Stack>

                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => handleCreateSession()}
                      disabled={
                        !organization ||
                        !apiUser ||
                        createSessionMutation.isPending
                      }
                      sx={{
                        textTransform: "none",
                        borderRadius: 999,
                        bgcolor: "#111827",
                        boxShadow: "none",
                        "&:hover": { bgcolor: "#000000", boxShadow: "none" },
                      }}
                    >
                      Новий діалог
                    </Button>
                  </Stack>

                  {isBootstrapLoading && (
                    <Paper
                      sx={{
                        p: 2,
                        borderRadius: 3,
                        border: "1px solid #e5e7eb",
                        bgcolor: "#f9fafb",
                      }}
                    >
                      <Stack direction="row" gap={2} alignItems="center">
                        <CircularProgress size={20} />
                        <Typography variant="body2" sx={{ color: "#4b5563" }}>
                          Синхронізуємо користувача та організацію…
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

                  <Box
                    sx={{
                      display: "grid",
                      gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
                      gap: 2,
                      minHeight: "480px",
                    }}
                  >
                    <Paper
                      sx={{
                        p: 2,
                        bgcolor: "#ffffff",
                        borderColor: "#e5e7eb",
                        borderRadius: 3,
                        display: "flex",
                        flexDirection: "column",
                      }}
                      variant="outlined"
                    >
                      <Typography
                        variant="subtitle2"
                        sx={{ mb: 1, color: "#6b7280", fontWeight: 600 }}
                      >
                        Діалоги
                      </Typography>

                      {isSessionsLoading && (
                        <Stack
                          flex={1}
                          alignItems="center"
                          justifyContent="center"
                        >
                          <CircularProgress size={20} />
                        </Stack>
                      )}

                      {sessionsError && (
                        <Typography variant="body2" color="#b91c1c">
                          Помилка завантаження діалогів: {sessionsError.message}
                        </Typography>
                      )}

                      {!isSessionsLoading && sessions.length === 0 && (
                        <Typography
                          variant="body2"
                          sx={{ mt: 1, color: "#6b7280" }}
                        >
                          Немає діалогів. Створи перший — натисни «Новий
                          діалог».
                        </Typography>
                      )}

                      {!isSessionsLoading && sessions.length > 0 && (
                        <List
                          dense
                          sx={{
                            mt: 1,
                            overflowY: "auto",
                            maxHeight: "60vh",
                            pr: 0.5,
                          }}
                        >
                          {sessions.map((s) => (
                            <ListItemButton
                              key={s.id}
                              selected={s.id === selectedSessionId}
                              onClick={() => setSelectedSessionId(s.id)}
                              sx={{
                                borderRadius: 2,
                                mb: 0.5,
                                alignItems: "stretch",
                                "&.Mui-selected": {
                                  bgcolor: "#eef2ff",
                                  "&:hover": { bgcolor: "#e0e7ff" },
                                },
                              }}
                            >
                              <ListItemText
                                primary={
                                  <Typography
                                    variant="body2"
                                    sx={{ color: "#111827" }}
                                    noWrap
                                  >
                                    {s.title}
                                  </Typography>
                                }
                                secondary={
                                  <Typography
                                    variant="caption"
                                    sx={{ color: "#9ca3af" }}
                                    noWrap
                                  >
                                    {formatDateStable(s.updatedAt)}
                                  </Typography>
                                }
                                sx={{ pr: 1 }}
                              />

                              <IconButton
                                edge="end"
                                size="small"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  openDeleteConfirm(s.id);
                                }}
                                disabled={
                                  !apiUser || deleteSessionMutation.isPending
                                }
                                sx={{
                                  alignSelf: "center",
                                  color: "#6b7280",
                                  "&:hover": {
                                    bgcolor: "#f3f4f6",
                                    color: "#111827",
                                  },
                                }}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </ListItemButton>
                          ))}
                        </List>
                      )}
                    </Paper>

                    <Paper
                      sx={{
                        p: 2,
                        display: "flex",
                        flexDirection: "column",
                        minHeight: "480px",
                        bgcolor: "#ffffff",
                        borderColor: "#e5e7eb",
                        borderRadius: 3,
                      }}
                      variant="outlined"
                    >
                      <Box
                        sx={{
                          pb: 1,
                          borderBottom: "1px solid #e5e7eb",
                          mb: 1.5,
                        }}
                      >
                        <Typography
                          variant="subtitle1"
                          sx={{ color: "#111827", fontWeight: 600 }}
                        >
                          {selectedSessionTitle || "Діалог"}
                        </Typography>

                        {clerkUser?.emailAddresses?.[0]?.emailAddress && (
                          <Typography
                            variant="caption"
                            sx={{ color: "#9ca3af" }}
                          >
                            Ти: {clerkUser.emailAddresses[0].emailAddress}
                          </Typography>
                        )}
                      </Box>

                      <Box
                        sx={{
                          flex: 1,
                          overflowY: "auto",
                          mb: 1.5,
                          display: "flex",
                          flexDirection: "column",
                          gap: 1,
                          pr: 0.5,
                        }}
                      >
                        {isSessionLoading && selectedSessionId && (
                          <Stack
                            flex={1}
                            alignItems="center"
                            justifyContent="center"
                          >
                            <CircularProgress size={22} />
                          </Stack>
                        )}

                        {!selectedSessionId && (
                          <Typography variant="body2" sx={{ color: "#6b7280" }}>
                            Обери діалог зліва або створи новий.
                          </Typography>
                        )}

                        {!isSessionLoading &&
                          selectedSessionId &&
                          messages.length === 0 && (
                            <Typography
                              variant="body2"
                              sx={{ color: "#6b7280" }}
                            >
                              Напиши перше повідомлення, щоб почати діалог.
                            </Typography>
                          )}

                        {!isSessionLoading &&
                          messages.map((m) => {
                            const isUser = m.role === "USER";
                            const align = isUser ? "flex-end" : "flex-start";
                            const bg = isUser ? "#111827" : "#f3f4f6";
                            const borderColor = isUser ? "#111827" : "#e5e7eb";
                            const textColor = isUser ? "#f9fafb" : "#111827";
                            const metaColor = isUser ? "#e5e7eb" : "#9ca3af";

                            return (
                              <Box
                                key={m.id}
                                sx={{ display: "flex", justifyContent: align }}
                              >
                                <Box
                                  sx={{
                                    maxWidth: "80%",
                                    bgcolor: bg,
                                    border: `1px solid ${borderColor}`,
                                    borderRadius: 2,
                                    px: 1.5,
                                    py: 1,
                                  }}
                                >
                                  <Typography
                                    variant="caption"
                                    sx={{
                                      display: "block",
                                      mb: 0.5,
                                      color: metaColor,
                                    }}
                                  >
                                    {isUser ? "Ти" : "Асистент"} ·{" "}
                                    {formatDateStable(m.createdAt)}
                                  </Typography>
                                  <Typography
                                    variant="body2"
                                    sx={{
                                      color: textColor,
                                      whiteSpace: "pre-wrap",
                                    }}
                                  >
                                    {m.content}
                                  </Typography>
                                </Box>
                              </Box>
                            );
                          })}
                      </Box>

                      <Box sx={{ borderTop: "1px solid #e5e7eb", pt: 1 }}>
                        <Stack direction="row" alignItems="flex-end" gap={1}>
                          <TextField
                            fullWidth
                            multiline
                            minRows={1}
                            maxRows={4}
                            placeholder="Напиши повідомлення (Enter — відправити, Shift+Enter — новий рядок)"
                            value={draft}
                            onChange={(e) => setDraft(e.target.value)}
                            onKeyDown={handleKeyDown}
                            size="small"
                            inputRef={inputRef}
                            InputProps={{
                              sx: { bgcolor: "#f9fafb", color: "#111827" },
                            }}
                          />
                          <IconButton
                            onClick={handleSend}
                            disabled={
                              !selectedSessionId ||
                              !apiUser ||
                              !draft.trim() ||
                              isSending
                            }
                            sx={{
                              bgcolor: "#111827",
                              color: "#f9fafb",
                              "&:hover": { bgcolor: "#000000" },
                            }}
                          >
                            {isSending ? (
                              <CircularProgress size={20} />
                            ) : (
                              <SendIcon />
                            )}
                          </IconButton>
                        </Stack>
                      </Box>
                    </Paper>
                  </Box>
                </Stack>
              </Box>
            </Box>
          </SignedIn>
        </Paper>
      </Container>

      <Dialog
        open={deleteDialogOpen}
        onClose={closeDeleteConfirm}
        maxWidth="xs"
        fullWidth
      >
        <DialogTitle sx={{ fontWeight: 800, color: "#111827" }}>
          Видалити діалог?
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: "#6b7280" }}>
            Діалог і всі повідомлення в ньому буде видалено назавжди.
          </DialogContentText>

          {deleteSessionMutation.isError && (
            <Box sx={{ mt: 1 }}>
              <Typography variant="caption" color="#b91c1c">
                Не вдалося видалити діалог. Спробуй ще раз.
              </Typography>
            </Box>
          )}
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button
            onClick={closeDeleteConfirm}
            disabled={deleteSessionMutation.isPending}
            sx={{ textTransform: "none" }}
          >
            Скасувати
          </Button>
          <Button
            onClick={confirmDelete}
            disabled={
              !pendingDeleteSessionId || deleteSessionMutation.isPending
            }
            variant="contained"
            sx={{
              textTransform: "none",
              borderRadius: 999,
              bgcolor: "#111827",
              boxShadow: "none",
              "&:hover": { bgcolor: "#000000", boxShadow: "none" },
            }}
          >
            {deleteSessionMutation.isPending ? "Видаляємо…" : "Видалити"}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
