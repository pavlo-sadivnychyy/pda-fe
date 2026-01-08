"use client";

import { Box, Chip, Container, Paper, Typography } from "@mui/material";
import { InfinitySpin } from "react-loader-spinner";
import { useTodoPage } from "@/app/todo/hooks/useTodoPage";
import { TodoHeader } from "@/app/todo/components/TodoHeader";
import { DateStrip } from "./components/DateStrip";
import { TasksList } from "@/app/todo/components/TasksList";
import { CreateTaskDialog } from "@/app/todo/components/CreateTaskDialog";

export default function TodoPage() {
  const {
    userId,
    isUserLoading,

    selectedDate,
    setSelectedDate,

    daysStrip,
    shiftStrip,
    resetToToday,

    isDialogOpen,
    openCreateDialog,
    closeCreateDialog,

    newTitle,
    setNewTitle,
    newDescription,
    setNewDescription,
    newTime,
    setNewTime,
    newPriority,
    setNewPriority,

    todayTasksCount,
    todayQuery,

    dayTasks,
    dayQuery,

    createTaskMutation,
    deleteTaskMutation,

    handleToggleStatus,
    submitCreateTask,
  } = useTodoPage();

  if (isUserLoading || !userId) {
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

  return (
    <Box sx={{ minHeight: "100vh", bgcolor: "#f4f5f7", py: { xs: 3, md: 8 } }}>
      <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3 } }}>
        <Chip
          label="TASK PLANNER"
          size="small"
          sx={{
            mb: 2,
            bgcolor: "#e5e7eb",
            color: "#4b5563",
            fontWeight: 500,
            borderRadius: "999px",
            fontSize: { xs: 10, sm: 12 },
            height: { xs: 22, sm: 24 },
          }}
        />

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
            onAdd={openCreateDialog}
            onDelete={(id) => deleteTaskMutation.mutate(id)}
            onToggleStatus={handleToggleStatus}
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
              Ви також можете змінювати статус задачі, по кліку на статус
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
        time={newTime}
        setTime={setNewTime}
        priority={newPriority}
        setPriority={setNewPriority}
        isCreating={createTaskMutation.isLoading}
      />
    </Box>
  );
}
