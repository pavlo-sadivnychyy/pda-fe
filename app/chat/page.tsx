'use client';

import { useEffect, useMemo, useState } from 'react';
import { SignedIn, SignedOut } from '@clerk/nextjs';
import {
    Box,
    Button,
    Card,
    CardContent,
    CardHeader,
    Chip,
    CircularProgress,
    IconButton,
    List,
    ListItemButton,
    ListItemText,
    Paper,
    Stack,
    TextField,
    Typography,
} from '@mui/material';
import SendIcon from '@mui/icons-material/Send';
import AddIcon from '@mui/icons-material/Add';

import { useKnowledgeBaseBootstrap } from '@/hooks/useKnowledgeBaseBootstrap';
import { useChatSessions } from '@/hooks/useChatSessions';
import { useChatSession } from '@/hooks/useChatSession';
import { useCreateChatSession } from '@/hooks/useCreateChatSession';
import { useSendChatMessage } from '@/hooks/useSendChatMessage';

function formatDateStable(dateStr: string) {
    const d = new Date(dateStr);
    if (Number.isNaN(d.getTime())) return '';
    const iso = d.toISOString();
    return iso.slice(0, 16).replace('T', ' ');
}

export default function ChatPage() {
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
        data: sessionsData,
        isLoading: isSessionsLoading,
        error: sessionsError,
    } = useChatSessions(organization?.id, apiUser?.id);

    const sessions = sessionsData?.items ?? [];

    const [selectedSessionId, setSelectedSessionId] =
        useState<string | undefined>(undefined);

    // як тільки підтягнули сесії — вибираємо першу, якщо нічого не вибрано
    useEffect(() => {
        if (!selectedSessionId && sessions.length > 0) {
            setSelectedSessionId(sessions[0].id);
        }
    }, [selectedSessionId, sessions]);

    const {
        data: sessionData,
        isLoading: isSessionLoading,
    } = useChatSession(selectedSessionId, apiUser?.id);

    const messages = sessionData?.session.messages ?? [];

    const createSessionMutation = useCreateChatSession();
    const sendMessageMutation = useSendChatMessage(organization?.id);

    const [draft, setDraft] = useState('');

    const handleCreateSession = () => {
        if (!organization || !apiUser) return;

        createSessionMutation.mutate(
            {
                organizationId: organization.id,
                createdById: apiUser.id,
                title: 'Новий діалог',
            },
            {
                onSuccess: (data) => {
                    setSelectedSessionId(data.session.id);
                },
            },
        );
    };

    const handleSend = () => {
        if (
            !draft.trim() ||
            !selectedSessionId ||
            !apiUser ||
            sendMessageMutation.isPending
        ) {
            return;
        }

        const content = draft.trim();
        setDraft('');

        sendMessageMutation.mutate({
            sessionId: selectedSessionId,
            userId: apiUser.id,
            content,
        });
    };

    const handleKeyDown: React.KeyboardEventHandler<HTMLTextAreaElement> = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            handleSend();
        }
    };

    const isSending = sendMessageMutation.isPending;

    const selectedSessionTitle = useMemo(() => {
        if (!selectedSessionId) return '';
        const s = sessions.find((x) => x.id === selectedSessionId);
        return s?.title ?? '';
    }, [sessions, selectedSessionId]);

    if (!hasMounted) {
        return null;
    }

    return (
        <Box
            sx={{
                height: '100vh',
                bgcolor: '#f3f4f6',
                display: 'flex',
                justifyContent: 'center',
                alignItems: 'center',
                px: 2,
                py: 2,
                overflow: 'hidden', // сторінка не скролиться
            }}
        >
            <Card
                elevation={4}
                sx={{
                    width: '100%',
                    maxWidth: 1400,
                    borderRadius: 4,
                    boxShadow: '0 18px 45px rgba(15, 23, 42, 0.18)',
                    overflow: 'hidden',
                    display: 'flex',
                    flexDirection: 'column',
                    maxHeight: '100%',
                }}
            >
                {/* Header в стилі інших сторінок */}
                <CardHeader
                    sx={{
                        px: { xs: 3, md: 4 },
                        pt: { xs: 3, md: 4 },
                        pb: 1,
                    }}
                    title={
                        <Stack spacing={1}>
                            <Chip
                                label="AI assistant"
                                size="small"
                                sx={{
                                    alignSelf: 'flex-start',
                                    borderRadius: 999,
                                    bgcolor: '#f3f4f6',
                                    color: '#6b7280',
                                    fontWeight: 500,
                                    fontSize: 11,
                                    textTransform: 'uppercase',
                                    letterSpacing: 0.5,
                                }}
                            />
                            <Typography
                                variant="h6"
                                sx={{
                                    fontWeight: 600,
                                    color: '#111827',
                                }}
                            >
                                AI-асистент
                            </Typography>
                            <Typography
                                variant="body2"
                                sx={{
                                    color: '#6b7280',
                                    maxWidth: '100%',
                                }}
                            >
                                Асистент, який знає твій бізнес-профіль та документи з бази знань,
                                щоб відповідати в контексті саме твого бізнесу.
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
                        display: 'flex',
                        flexDirection: 'column',
                        overflow: 'hidden', // контролюємо скрол всередині
                    }}
                >
                    <SignedOut>
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                            }}
                        >
                            <Typography color="#6b7280">
                                Щоб користуватись AI-чатом, спочатку увійди в акаунт.
                            </Typography>
                        </Box>
                    </SignedOut>

                    <SignedIn>
                        <Box
                            sx={{
                                flex: 1,
                                display: 'flex',
                                flexDirection: 'column',
                                overflow: 'hidden',
                            }}
                        >
                            {/* Весь скрол чату всередині цього бокса */}
                            <Box
                                sx={{
                                    flex: 1,
                                    overflowY: 'auto',
                                    pr: 1,
                                    pb: 1,
                                    '&::-webkit-scrollbar': {
                                        width: 6,
                                    },
                                    '&::-webkit-scrollbar-thumb': {
                                        borderRadius: 999,
                                        backgroundColor: '#d1d5db',
                                    },
                                    '&::-webkit-scrollbar-track': {
                                        backgroundColor: 'transparent',
                                    },
                                }}
                            >
                                <Stack gap={3}>
                                    {/* Header + кнопка нового діалогу */}
                                    <Stack
                                        direction={{ xs: 'column', md: 'row' }}
                                        justifyContent="space-between"
                                        alignItems={{ xs: 'flex-start', md: 'center' }}
                                        gap={2}
                                    >
                                        <Stack spacing={0.5}>
                                            <Typography
                                                variant="h5"
                                                sx={{ fontWeight: 600, color: '#111827' }}
                                            >
                                                Діалоги з асистентом
                                            </Typography>
                                            <Typography variant="body2" sx={{ color: '#6b7280' }}>
                                                Постав питання по документах, процесах або клієнтах —
                                                асистент врахує твій профіль та базу знань.
                                            </Typography>
                                        </Stack>

                                        <Button
                                            variant="contained"
                                            startIcon={<AddIcon />}
                                            onClick={handleCreateSession}
                                            disabled={
                                                !organization ||
                                                !apiUser ||
                                                createSessionMutation.isPending
                                            }
                                            sx={{
                                                textTransform: 'none',
                                                borderRadius: 999,
                                                bgcolor: '#111827',
                                                boxShadow: 'none',
                                                '&:hover': {
                                                    bgcolor: '#000000',
                                                    boxShadow: 'none',
                                                },
                                            }}
                                        >
                                            Новий діалог
                                        </Button>
                                    </Stack>

                                    {/* Bootstrap / errors */}
                                    {isBootstrapLoading && (
                                        <Paper
                                            sx={{
                                                p: 2,
                                                borderRadius: 3,
                                                border: '1px solid #e5e7eb',
                                                bgcolor: '#f9fafb',
                                            }}
                                        >
                                            <Stack direction="row" gap={2} alignItems="center">
                                                <CircularProgress size={20} />
                                                <Typography
                                                    variant="body2"
                                                    sx={{ color: '#4b5563' }}
                                                >
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
                                                border: '1px solid #fecaca',
                                                bgcolor: '#fef2f2',
                                            }}
                                        >
                                            <Typography variant="body2" color="#b91c1c">
                                                Помилка ініціалізації:{' '}
                                                {(bootstrapError as Error).message}
                                            </Typography>
                                        </Paper>
                                    )}

                                    {/* Основний layout чату */}
                                    <Box
                                        sx={{
                                            display: 'grid',
                                            gridTemplateColumns: {
                                                xs: '1fr',
                                                md: '280px 1fr',
                                            },
                                            gap: 2,
                                            minHeight: '480px',
                                        }}
                                    >
                                        {/* Ліва колонка — список діалогів */}
                                        <Paper
                                            sx={{
                                                p: 2,
                                                bgcolor: '#ffffff',
                                                borderColor: '#e5e7eb',
                                                borderRadius: 3,
                                                display: 'flex',
                                                flexDirection: 'column',
                                            }}
                                            variant="outlined"
                                        >
                                            <Typography
                                                variant="subtitle2"
                                                sx={{ mb: 1, color: '#6b7280', fontWeight: 600 }}
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
                                                    Помилка завантаження діалогів:{' '}
                                                    {(sessionsError as Error).message}
                                                </Typography>
                                            )}

                                            {!isSessionsLoading && sessions.length === 0 && (
                                                <Typography
                                                    variant="body2"
                                                    sx={{ mt: 1, color: '#6b7280' }}
                                                >
                                                    Немає діалогів. Створи перший — натисни «Новий діалог».
                                                </Typography>
                                            )}

                                            {!isSessionsLoading && sessions.length > 0 && (
                                                <List
                                                    dense
                                                    sx={{
                                                        mt: 1,
                                                        overflowY: 'auto',
                                                        maxHeight: '60vh',
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
                                                                '&.Mui-selected': {
                                                                    bgcolor: '#eef2ff',
                                                                    '&:hover': {
                                                                        bgcolor: '#e0e7ff',
                                                                    },
                                                                },
                                                            }}
                                                        >
                                                            <ListItemText
                                                                primary={
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{ color: '#111827' }}
                                                                        noWrap
                                                                    >
                                                                        {s.title}
                                                                    </Typography>
                                                                }
                                                                secondary={
                                                                    <Typography
                                                                        variant="caption"
                                                                        sx={{ color: '#9ca3af' }}
                                                                        noWrap
                                                                    >
                                                                        {formatDateStable(s.updatedAt)}
                                                                    </Typography>
                                                                }
                                                            />
                                                        </ListItemButton>
                                                    ))}
                                                </List>
                                            )}
                                        </Paper>

                                        {/* Права колонка — чат */}
                                        <Paper
                                            sx={{
                                                p: 2,
                                                display: 'flex',
                                                flexDirection: 'column',
                                                minHeight: '480px',
                                                bgcolor: '#ffffff',
                                                borderColor: '#e5e7eb',
                                                borderRadius: 3,
                                            }}
                                            variant="outlined"
                                        >
                                            {/* Заголовок чату */}
                                            <Box
                                                sx={{
                                                    pb: 1,
                                                    borderBottom: '1px solid #e5e7eb',
                                                    mb: 1.5,
                                                }}
                                            >
                                                <Typography
                                                    variant="subtitle1"
                                                    sx={{ color: '#111827', fontWeight: 600 }}
                                                >
                                                    {selectedSessionTitle || 'Діалог'}
                                                </Typography>
                                                {clerkUser?.emailAddresses?.[0]?.emailAddress && (
                                                    <Typography
                                                        variant="caption"
                                                        sx={{ color: '#9ca3af' }}
                                                    >
                                                        Ти: {clerkUser.emailAddresses[0].emailAddress}
                                                    </Typography>
                                                )}
                                            </Box>

                                            {/* Історія повідомлень */}
                                            <Box
                                                sx={{
                                                    flex: 1,
                                                    overflowY: 'auto',
                                                    mb: 1.5,
                                                    display: 'flex',
                                                    flexDirection: 'column',
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

                                                {!isSessionLoading &&
                                                    messages.length === 0 &&
                                                    selectedSessionId && (
                                                        <Typography
                                                            variant="body2"
                                                            sx={{ color: '#6b7280' }}
                                                        >
                                                            Напиши перше повідомлення, щоб почати діалог.
                                                        </Typography>
                                                    )}

                                                {!selectedSessionId && (
                                                    <Typography
                                                        variant="body2"
                                                        sx={{ color: '#6b7280' }}
                                                    >
                                                        Обери діалог зліва або створи новий.
                                                    </Typography>
                                                )}

                                                {!isSessionLoading &&
                                                    messages.map((m) => {
                                                        const isUser = m.role === 'USER';
                                                        const align = isUser ? 'flex-end' : 'flex-start';
                                                        const bg = isUser ? '#111827' : '#f3f4f6';
                                                        const borderColor = isUser
                                                            ? '#111827'
                                                            : '#e5e7eb';
                                                        const textColor = isUser ? '#f9fafb' : '#111827';
                                                        const metaColor = isUser ? '#e5e7eb' : '#9ca3af';

                                                        return (
                                                            <Box
                                                                key={m.id}
                                                                sx={{
                                                                    display: 'flex',
                                                                    justifyContent: align,
                                                                }}
                                                            >
                                                                <Box
                                                                    sx={{
                                                                        maxWidth: '80%',
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
                                                                            display: 'block',
                                                                            mb: 0.5,
                                                                            color: metaColor,
                                                                        }}
                                                                    >
                                                                        {isUser ? 'Ти' : 'Асистент'} ·{' '}
                                                                        {formatDateStable(m.createdAt)}
                                                                    </Typography>
                                                                    <Typography
                                                                        variant="body2"
                                                                        sx={{
                                                                            color: textColor,
                                                                            whiteSpace: 'pre-wrap',
                                                                        }}
                                                                    >
                                                                        {m.content}
                                                                    </Typography>
                                                                </Box>
                                                            </Box>
                                                        );
                                                    })}
                                            </Box>

                                            {/* Поле вводу */}
                                            <Box
                                                sx={{
                                                    borderTop: '1px solid #e5e7eb',
                                                    pt: 1,
                                                }}
                                            >
                                                <Stack
                                                    direction="row"
                                                    alignItems="flex-end"
                                                    gap={1}
                                                >
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
                                                        InputProps={{
                                                            sx: {
                                                                bgcolor: '#f9fafb',
                                                                color: '#111827',
                                                            },
                                                        }}
                                                    />
                                                    <IconButton
                                                        color="primary"
                                                        onClick={handleSend}
                                                        disabled={
                                                            !selectedSessionId ||
                                                            !apiUser ||
                                                            !draft.trim() ||
                                                            isSending
                                                        }
                                                        sx={{
                                                            bgcolor: '#111827',
                                                            color: '#f9fafb',
                                                            '&:hover': {
                                                                bgcolor: '#000000',
                                                            },
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
                </CardContent>
            </Card>
        </Box>
    );
}
