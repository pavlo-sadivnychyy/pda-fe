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
  Drawer,
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
import MenuIcon from "@mui/icons-material/Menu";
import { useRouter, useSearchParams } from "next/navigation";
import { useQueryClient } from "@tanstack/react-query";

import { useKnowledgeBaseBootstrap } from "@/hooks/useKnowledgeBaseBootstrap";
import { useChatSessions } from "@/hooks/useChatSessions";
import { useChatSession } from "@/hooks/useChatSession";
import { useCreateChatSession } from "@/hooks/useCreateChatSession";
import { useSendChatMessage } from "@/hooks/useSendChatMessage";
import { useDeleteChatSession } from "@/hooksNew/useDeleteChatSession";

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

const scrollBarSx = {
  "&::-webkit-scrollbar": { width: 6 },
  "&::-webkit-scrollbar-thumb": {
    borderRadius: 999,
    backgroundColor: "#d1d5db",
  },
  "&::-webkit-scrollbar-track": {
    backgroundColor: "transparent",
  },
} as const;

export default function ChatClient() {
  const [hasMounted, setHasMounted] = useState(false);
  useEffect(() => setHasMounted(true), []);

  const router = useRouter();
  const searchParams = useSearchParams();
  const queryClient = useQueryClient();

  const prefillParam = decodeSearchParam(searchParams.get("prefill"));
  const shouldCreateNew = searchParams.get("new") === "1";

  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement | null>(null);
  const didHandleDeepLinkRef = useRef(false);
  const didAutoCreateEmptySessionRef = useRef(false);

  const chatBottomRef = useRef<HTMLDivElement | null>(null);

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const { data: bootstrapData } = useKnowledgeBaseBootstrap();

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

  useEffect(() => {
    if (sessions.length === 0) {
      if (selectedSessionId !== undefined) setSelectedSessionId(undefined);
      return;
    }
    if (!selectedSessionId) {
      setSelectedSessionId(sessions[0].id);
    }
  }, [sessions, selectedSessionId]);

  const {
    data: sessionData,
    isLoading: isSessionLoading,
    refetch: refetchSession,
  } = useChatSession(selectedSessionId, apiUser?.id) as any;

  const serverMessages = sessionData?.session?.messages ?? [];

  const [localMessages, setLocalMessages] = useState<any[]>([]);

  useEffect(() => {
    setLocalMessages(serverMessages);
  }, [selectedSessionId, sessionData]);

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [localMessages.length]);

  const createSessionMutation = useCreateChatSession();
  const sendMessageMutation = useSendChatMessage(organization?.id);
  const deleteSessionMutation = useDeleteChatSession();

  const [draft, setDraft] = useState("");

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
        onSuccess: (data: any) => {
          setSelectedSessionId(data.session.id);
          setSidebarOpen(false); // ✅ on mobile close drawer
          setTimeout(() => inputRef.current?.focus(), 50);
        },
      },
    );
  };

  // ✅ auto-create first empty dialog if none exists
  useEffect(() => {
    if (!organization || !apiUser) return;
    if (isSessionsLoading || sessionsError) return;
    if (didAutoCreateEmptySessionRef.current) return;
    if (shouldCreateNew) return;

    if (sessions.length === 0 && !createSessionMutation.isPending) {
      didAutoCreateEmptySessionRef.current = true;

      createSessionMutation.mutate(
        {
          organizationId: organization.id,
          createdById: apiUser.id,
          title: "Новий діалог",
        },
        {
          onSuccess: (data: any) => {
            setSelectedSessionId(data.session.id);
            setSidebarOpen(false);
            setTimeout(() => inputRef.current?.focus(), 50);
          },
          onError: () => {
            didAutoCreateEmptySessionRef.current = false;
          },
        },
      );
    }
  }, [
    organization,
    apiUser,
    sessions.length,
    isSessionsLoading,
    sessionsError,
    shouldCreateNew,
    createSessionMutation.isPending,
  ]);

  // ✅ deep-link
  useEffect(() => {
    if (!hasMounted) return;
    if (didHandleDeepLinkRef.current) return;
    if (!organization || !apiUser) return;

    const hasAction = shouldCreateNew || !!prefillParam;
    if (!hasAction) return;

    didHandleDeepLinkRef.current = true;

    if (prefillParam) {
      setDraft(prefillParam);
      setTimeout(() => inputRef.current?.focus(), 50);
    }

    if (shouldCreateNew) {
      const smartTitle = prefillParam?.slice(0, 44)?.trim() || "Новий діалог";

      createSessionMutation.mutate(
        {
          organizationId: organization.id,
          createdById: apiUser.id,
          title: smartTitle,
        },
        {
          onSuccess: (data: any) => {
            setSelectedSessionId(data.session.id);
            setSidebarOpen(false);
            setTimeout(() => inputRef.current?.focus(), 50);
            router.replace("/chat");
          },
          onError: () => router.replace("/chat"),
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
  ]);

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

  const handleSend = () => {
    if (!draft.trim() || !selectedSessionId || !apiUser || isSending) return;

    const content = draft.trim();
    setDraft("");

    const tempUserMessage = {
      id: `temp-${Date.now()}`,
      role: "USER",
      content,
      createdAt: new Date().toISOString(),
    };

    setLocalMessages((prev) => [...prev, tempUserMessage]);

    sendMessageMutation.mutate(
      { sessionId: selectedSessionId, userId: apiUser.id, content },
      {
        onSuccess: (data: any) => {
          setLocalMessages((prev) => {
            const replaced = data?.userMessage
              ? prev.map((m) =>
                  String(m.id).startsWith("temp-") && m.content === content
                    ? data.userMessage
                    : m,
                )
              : prev;

            return data?.assistantMessage
              ? [...replaced, data.assistantMessage]
              : replaced;
          });

          try {
            refetchSession?.();
          } catch {}

          queryClient.invalidateQueries({ queryKey: ["chat-session"] });
          queryClient.invalidateQueries({ queryKey: ["chat-sessions"] });
        },
        onError: () => {
          setDraft(content);
          setLocalMessages((prev) =>
            prev.filter(
              (m) =>
                !(String(m.id).startsWith("temp-") && m.content === content),
            ),
          );
        },
      },
    );
  };

  const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (
    e,
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handlePickSession = (id: string) => {
    setSelectedSessionId(id);
    setSidebarOpen(false); // ✅ mobile UX
    setTimeout(() => inputRef.current?.focus(), 50);
  };

  if (!hasMounted) return null;

  const SidebarContent = (
    <Box sx={styles.sidebar}>
      <Stack direction="row" justifyContent="space-between" alignItems="center">
        <Typography
          variant="subtitle2"
          sx={{ color: "#6b7280", fontWeight: 700 }}
        >
          Діалоги
        </Typography>

        <Button
          size="small"
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleCreateSession()}
          disabled={
            !organization || !apiUser || createSessionMutation.isPending
          }
          sx={{
            textTransform: "none",
            borderRadius: 999,
            bgcolor: "#111827",
            boxShadow: "none",
            px: 1.5,
            color: "white",
            "&:hover": { bgcolor: "#000000", boxShadow: "none" },
          }}
        >
          Новий
        </Button>
      </Stack>

      <Box sx={{ mt: 1, flex: 1, minHeight: 0, overflow: "hidden" }}>
        {isSessionsLoading && (
          <Stack flex={1} alignItems="center" justifyContent="center">
            <CircularProgress size={20} />
          </Stack>
        )}

        {sessionsError && (
          <Typography variant="body2" color="#b91c1c">
            Помилка завантаження діалогів: {sessionsError.message}
          </Typography>
        )}

        {!isSessionsLoading && sessions.length > 0 && (
          <List dense sx={styles.sessionsScroll}>
            {sessions.map((s: any) => (
              <ListItemButton
                key={s.id}
                selected={s.id === selectedSessionId}
                onClick={() => handlePickSession(s.id)}
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
                  disabled={!apiUser || deleteSessionMutation.isPending}
                  sx={{
                    alignSelf: "center",
                    color: "#6b7280",
                    "&:hover": { bgcolor: "#f3f4f6", color: "#111827" },
                  }}
                >
                  <DeleteOutlineIcon fontSize="small" />
                </IconButton>
              </ListItemButton>
            ))}
          </List>
        )}

        {!isSessionsLoading && sessions.length === 0 && (
          <Typography variant="body2" sx={{ mt: 1, color: "#6b7280" }}>
            Створюємо перший діалог…
          </Typography>
        )}
      </Box>
    </Box>
  );

  return (
    <Box sx={styles.page}>
      <Container maxWidth="lg" sx={styles.container}>
        <Box sx={styles.header}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", mb: 2 }}
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

        <Paper elevation={0} sx={styles.paper}>
          <SignedOut>
            <Box sx={{ flex: 1, display: "grid", placeItems: "center", px: 2 }}>
              <Typography color="#6b7280">
                Щоб користуватись AI-чатом, спочатку увійди в акаунт.
              </Typography>
            </Box>
          </SignedOut>

          <SignedIn>
            <Box sx={styles.chatShell}>
              {/* ✅ top bar inside paper */}
              <Stack
                direction="row"
                justifyContent="space-between"
                alignItems="center"
                gap={1}
                sx={styles.innerHeader}
              >
                <Stack direction="row" gap={1} alignItems="center">
                  {/* ✅ mobile hamburger */}
                  <IconButton
                    onClick={() => setSidebarOpen(true)}
                    sx={{
                      display: { xs: "inline-flex", md: "none" },
                      border: "1px solid #e5e7eb",
                      bgcolor: "#ffffff",
                    }}
                  >
                    <MenuIcon />
                  </IconButton>

                  <Typography
                    variant="h6"
                    sx={{ fontWeight: 700, color: "#111827" }}
                  >
                    {selectedSessionTitle || "Діалог"}
                  </Typography>
                </Stack>

                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleCreateSession()}
                  disabled={
                    !organization || !apiUser || createSessionMutation.isPending
                  }
                  sx={{
                    textTransform: "none",
                    borderRadius: 999,
                    bgcolor: "#111827",
                    boxShadow: "none",
                    color: "white",
                    "&:hover": { bgcolor: "#000000", boxShadow: "none" },
                  }}
                >
                  Новий діалог
                </Button>
              </Stack>

              {/* ✅ desktop grid */}
              <Box sx={styles.grid}>
                <Box
                  sx={{ display: { xs: "none", md: "block" }, minHeight: 0 }}
                >
                  <Paper variant="outlined" sx={styles.sidebarPaper}>
                    {SidebarContent}
                  </Paper>
                </Box>

                <Paper sx={styles.chatPanel} variant="outlined">
                  <Box sx={styles.messagesScroll}>
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
                        Обери діалог або створи новий.
                      </Typography>
                    )}

                    {!isSessionLoading &&
                      selectedSessionId &&
                      localMessages.length === 0 && (
                        <Typography variant="body2" sx={{ color: "#6b7280" }}>
                          Напиши перше повідомлення, щоб почати діалог.
                        </Typography>
                      )}

                    {!isSessionLoading &&
                      localMessages.map((m: any) => {
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
                                maxWidth: "86%",
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

                    <div ref={chatBottomRef} />
                  </Box>

                  <Box sx={styles.composer}>
                    <Stack direction="row" alignItems="flex-end" gap={1}>
                      <TextField
                        fullWidth
                        multiline
                        minRows={1}
                        maxRows={4}
                        placeholder="Напиши повідомлення"
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
            </Box>
          </SignedIn>
        </Paper>
      </Container>

      {/* ✅ MOBILE SIDEBAR DRAWER */}
      <Drawer
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
        anchor="left"
        PaperProps={{
          sx: {
            width: "86vw",
            maxWidth: 360,
            bgcolor: "#ffffff",
            borderRight: "1px solid #e5e7eb",
          },
        }}
      >
        <Box sx={{ height: "100%", display: "flex", flexDirection: "column" }}>
          <Box sx={{ p: 2, borderBottom: "1px solid #e5e7eb" }}>
            <Typography sx={{ fontWeight: 800, color: "#111827" }}>
              Діалоги
            </Typography>
            <Typography variant="caption" sx={{ color: "#6b7280" }}>
              Обери діалог або створи новий
            </Typography>
          </Box>

          <Box sx={{ flex: 1, minHeight: 0, p: 2 }}>{SidebarContent}</Box>
        </Box>
      </Drawer>

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
              color: "white",
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

const styles = {
  page: {
    height: "100dvh",
    overflow: "hidden",
    bgcolor: "#f3f4f6",
    display: "flex",
  },

  container: {
    flex: 1,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    py: { xs: 2, md: 4 },
    px: { xs: 2, sm: 3 },
  },

  header: {
    flexShrink: 0,
    mb: 2.5,
  },

  paper: {
    flex: 1,
    minHeight: 0,
    borderRadius: 4,
    p: { xs: 2, md: 4 },
    boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
    bgcolor: "#ffffff",
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  chatShell: {
    flex: 1,
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
  },

  innerHeader: {
    flexShrink: 0,
    mb: 2,
  },

  grid: {
    flex: 1,
    minHeight: 0,
    display: "grid",
    gridTemplateColumns: { xs: "1fr", md: "280px 1fr" },
    gap: 2,
  },

  sidebarPaper: {
    height: "100%",
    minHeight: 0,
    overflow: "hidden",
    borderRadius: 3,
    borderColor: "#e5e7eb",
  },

  sidebar: {
    height: "100%",
    minHeight: 0,
    display: "flex",
    flexDirection: "column",
    overflow: "hidden",
    p: 2,
  },

  sessionsScroll: {
    mt: 1,
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    pr: 0.5,
    ...scrollBarSx,
  },

  chatPanel: {
    p: 2,
    bgcolor: "#ffffff",
    borderColor: "#e5e7eb",
    borderRadius: 3,
    display: "flex",
    flexDirection: "column",
    minHeight: 0,
    overflow: "hidden",
  },

  messagesScroll: {
    flex: 1,
    minHeight: 0,
    overflowY: "auto",
    display: "flex",
    flexDirection: "column",
    gap: 1,
    pr: 0.5,
    ...scrollBarSx,
  },

  composer: {
    borderTop: "1px solid #e5e7eb",
    pt: 1,
    flexShrink: 0,
  },
} as const;
