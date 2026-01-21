"use client";

import Link from "next/link";
import {
  Box,
  Button,
  Chip,
  Container,
  Paper,
  Stack,
  Typography,
  Card,
  CardContent,
} from "@mui/material";
import EventNoteIcon from "@mui/icons-material/EventNote";
import { InfinitySpin } from "react-loader-spinner";

import { useTodoPage } from "@/app/todo/hooks/useTodoPage";
import { TodoHeader } from "@/app/todo/components/TodoHeader";
import { DateStrip } from "@/app/todo/components/DateStrip";
import { TasksList } from "@/app/todo/components/TasksList";
import { CreateTaskDialog } from "@/app/todo/components/CreateTaskDialog";
import { MoveTaskDialog } from "@/app/todo/components/MoveTaskDialog";
import KeyboardReturnIcon from "@mui/icons-material/KeyboardReturn";
import { useRouter } from "next/navigation";

import BusinessIcon from "@mui/icons-material/Business";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";

function NoOrgState() {
  return (
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
            Планувальник задач працює в контексті твого акаунта/організації.
            Створи організацію — і тоді зможеш додавати задачі та планувати
            день.
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
  );
}

export default function TodoPage() {
  const {
    userId,
    isUserLoading,

    selectedDate,
    setSelectedDate,

    daysStrip,
    shiftStrip,
    resetToToday,

    // create
    isDialogOpen,
    openCreateDialog,
    closeCreateDialog,

    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    startTime,
    setStartTime,
    endTime,
    setEndTime,
    newPriority,
    setNewPriority,

    // move
    isMoveOpen,
    moveTask,
    moveDate,
    setMoveDate,
    openMoveDialog,
    closeMoveDialog,
    submitMoveTask,

    todayTasksCount,
    todayQuery,

    dayTasks,
    dayQuery,

    createTaskMutation,
    deleteTaskMutation,
    moveTaskMutation,

    handleToggleStatus,
    submitCreateTask,
  } = useTodoPage();

  const router = useRouter();

  // ✅ Loading
  if (isUserLoading) {
    return (
      <Box
        sx={{
          minHeight: "100vh",
          bgcolor: "#f4f5f7",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <InfinitySpin width="200" color="#202124" />
      </Box>
    );
  }

  // ✅ Empty state (як ти просив “таке саме”)
  if (!userId) {
    return (
      <Box sx={{ minHeight: "100dvh", bgcolor: "#f4f5f7", py: 4 }}>
        <Container
          maxWidth="lg"
          sx={{
            px: { xs: 2, sm: 3 },
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
          }}
        >
          {/* Header */}
          <Box sx={{ mb: 2.5 }}>
            <Button
              onClick={() => router.push("/dashboard")}
              sx={{ color: "black", mb: 2 }}
              startIcon={<KeyboardReturnIcon fontSize="inherit" />}
            >
              на головну
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
                  <EventNoteIcon sx={{ color: "#0f172a" }} />
                </Box>

                <Typography
                  variant="h5"
                  sx={{ fontWeight: 800, color: "#0f172a" }}
                >
                  Планувальник задач
                </Typography>
              </Stack>

              <Chip
                label="Task planner"
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
              Додавай задачі, змінюй статуси одним кліком і перенось на інші
              дні. Асистент може використовувати ці дані для побудови плану дня.
            </Typography>
          </Box>

          {/* Center */}
          <Box
            sx={{
              flex: 1,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              pb: { xs: 2, sm: 3 },
            }}
          >
            <NoOrgState />
          </Box>
        </Container>
      </Box>
    );
  }

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f5f7", padding: "32px 0" }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        {/* ✅ Хедер як на OrganizationProfilePage */}
        <Box sx={{ mb: 2.5 }}>
          <Button
            onClick={() => router.push("/dashboard")}
            sx={{ color: "black", marginBottom: "20px" }}
            startIcon={<KeyboardReturnIcon fontSize="inherit" />}
          >
            на головну
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
                <EventNoteIcon sx={{ color: "#0f172a" }} />
              </Box>

              <Typography
                variant="h5"
                sx={{ fontWeight: 800, color: "#0f172a" }}
              >
                Планувальник задач
              </Typography>
            </Stack>

            <Chip
              label={selectedDate ? `Дата: ${selectedDate}` : "Task planner"}
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
            Додавай задачі, змінюй статуси одним кліком і перенось на інші дні.
            Асистент може використовувати ці дані для побудови плану дня.
          </Typography>
        </Box>

        <Paper
          elevation={0}
          sx={{
            borderRadius: 4,
            p: { xs: 2, md: 4 },
            boxShadow: "0 24px 60px rgba(15, 23, 42, 0.12)",
            bgcolor: "#ffffff",
          }}
        >
          <TodoHeader
            todayTasksCount={todayTasksCount}
            isTodayLoading={todayQuery.isLoading}
          />

          <DateStrip
            days={daysStrip}
            selectedDate={selectedDate}
            onSelect={setSelectedDate}
            onPrev={() => shiftStrip("prev")}
            onNext={() => shiftStrip("next")}
            onToday={resetToToday}
          />

          <TasksList
            tasks={dayTasks}
            isLoading={dayQuery.isLoading}
            isFetching={dayQuery.isFetching}
            isDeleting={deleteTaskMutation.isLoading}
            isMoving={moveTaskMutation.isLoading}
            onAdd={openCreateDialog}
            onDelete={(id) => deleteTaskMutation.mutate(id)}
            onToggleStatus={handleToggleStatus}
            onOpenMove={openMoveDialog}
          />

          <Box
            sx={{
              mt: { xs: 3, md: 4 },
              color: "#020617",
              px: { xs: 2, md: 3 },
              py: { xs: 1.2, md: 1.6 },
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              flexDirection: "column",
              textAlign: "center",
            }}
          >
            <Typography fontSize={{ xs: 11, md: 13 }}>
              Профіль задач зберігається у твоєму акаунті. Асистент використовує
              їх, щоб планувати твій день.
            </Typography>
            <Typography fontSize={{ xs: 11, md: 13 }}>
              Статус змінюється по кліку на чіп статусу. Перенесення — через
              іконку “перенести”.
            </Typography>
          </Box>
        </Paper>
      </Container>

      <CreateTaskDialog
        open={isDialogOpen}
        onClose={closeCreateDialog}
        onSubmit={submitCreateTask}
        selectedDate={selectedDate}
        title={newTitle}
        setTitle={setNewTitle}
        description={newDescription}
        setDescription={setNewDescription}
        startTime={startTime}
        setStartTime={setStartTime}
        endTime={endTime}
        setEndTime={setEndTime}
        priority={newPriority}
        setPriority={setNewPriority}
        isCreating={createTaskMutation.isLoading}
      />

      <MoveTaskDialog
        open={isMoveOpen}
        task={moveTask}
        date={moveDate}
        setDate={setMoveDate}
        onClose={closeMoveDialog}
        onMove={submitMoveTask}
        isMoving={moveTaskMutation.isLoading}
      />
    </Box>
  );
}
