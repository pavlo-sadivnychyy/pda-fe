"use client";

import React, { useEffect, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Snackbar,
  TextField,
  Typography,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import { DataGrid, GridColDef, GridRowParams } from "@mui/x-data-grid";
import { useCurrentUser } from "@/hooksNew/useAppBootstrap";
import { useOrganization } from "@/hooksNew/useAllUserOrganizations";

// 👇 Підлаштуй під свій бекенд / env
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

type Client = {
  id: string;
  organizationId: string;
  createdById: string;
  name: string;
  contactName?: string | null;
  email?: string | null;
  phone?: string | null;
  taxNumber?: string | null;
  address?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
};

type ClientFormValues = {
  name: string;
  contactName: string;
  email: string;
  phone: string;
  taxNumber: string;
  address: string;
  notes: string;
};

const defaultForm: ClientFormValues = {
  name: "",
  contactName: "",
  email: "",
  phone: "",
  taxNumber: "",
  address: "",
  notes: "",
};

const ClientsPage: React.FC = () => {
  const { data: userData } = useCurrentUser();
  const currentUserId = (userData as any)?.id ?? null;

  const { data: orgData } = useOrganization(currentUserId || undefined);
  const organizationId = orgData?.items[0]?.organizationId;

  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingClient, setEditingClient] = useState<Client | null>(null);
  const [form, setForm] = useState<ClientFormValues>(defaultForm);

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState<"success" | "error">(
    "success",
  );

  const showSnackbar = (message: string, severity: "success" | "error") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const handleCloseSnackbar = () => setSnackbarOpen(false);

  const fetchClients = async () => {
    try {
      if (!organizationId) return;
      setLoading(true);
      const url = `${API_BASE_URL}/clients?organizationId=${encodeURIComponent(
        organizationId,
      )}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error("Failed to fetch clients");
      const data = await res.json();
      setClients(data.clients || []);
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка завантаження клієнтів", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchClients();
  }, [organizationId]);

  const openCreateDialog = () => {
    setEditingClient(null);
    setForm(defaultForm);
    setDialogOpen(true);
  };

  const openEditDialog = (client: Client) => {
    setEditingClient(client);
    setForm({
      name: client.name || "",
      contactName: client.contactName || "",
      email: client.email || "",
      phone: client.phone || "",
      taxNumber: client.taxNumber || "",
      address: client.address || "",
      notes: client.notes || "",
    });
    setDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setDialogOpen(false);
  };

  const handleFormChange = (field: keyof ClientFormValues, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    try {
      if (!organizationId || !currentUserId) {
        showSnackbar("Немає organizationId або currentUserId", "error");
        return;
      }

      if (!form.name.trim()) {
        showSnackbar("Вкажи назву клієнта", "error");
        return;
      }

      const payload = {
        organizationId,
        createdById: currentUserId,
        name: form.name.trim(),
        contactName: form.contactName.trim() || undefined,
        email: form.email.trim() || undefined,
        phone: form.phone.trim() || undefined,
        taxNumber: form.taxNumber.trim() || undefined,
        address: form.address.trim() || undefined,
        notes: form.notes.trim() || undefined,
      };

      if (editingClient) {
        // update
        const res = await fetch(`${API_BASE_URL}/clients/${editingClient.id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: payload.name,
            contactName: payload.contactName ?? null,
            email: payload.email ?? null,
            phone: payload.phone ?? null,
            taxNumber: payload.taxNumber ?? null,
            address: payload.address ?? null,
            notes: payload.notes ?? null,
          }),
        });

        if (!res.ok) {
          console.error(await res.text());
          throw new Error("Failed to update client");
        }

        showSnackbar("Клієнта оновлено", "success");
      } else {
        // create
        const res = await fetch(`${API_BASE_URL}/clients`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        });

        if (!res.ok) {
          console.error(await res.text());
          throw new Error("Failed to create client");
        }

        showSnackbar("Клієнта створено", "success");
      }

      setDialogOpen(false);
      await fetchClients();
    } catch (e) {
      console.error(e);
      showSnackbar("Помилка збереження клієнта", "error");
    }
  };

  const handleRowDoubleClick = (params: GridRowParams) => {
    const client = clients.find((c) => c.id === params.id);
    if (client) {
      openEditDialog(client);
    }
  };

  const formatDate = (value?: string | null) => {
    if (!value) return "—";
    try {
      return value.slice(0, 10);
    } catch {
      return value;
    }
  };

  const rows = clients.map((c) => ({
    id: c.id,
    name: c.name,
    contactName: c.contactName || "",
    email: c.email || "",
    phone: c.phone || "",
    taxNumber: c.taxNumber || "",
    createdAt: formatDate(c.createdAt ?? null),
  }));

  const columns: GridColDef[] = [
    {
      field: "name",
      headerName: "Назва клієнта",
      flex: 1.4,
      minWidth: 200,
    },
    {
      field: "contactName",
      headerName: "Контактна особа",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "email",
      headerName: "Email",
      flex: 1,
      minWidth: 180,
    },
    {
      field: "phone",
      headerName: "Телефон",
      flex: 0.9,
      minWidth: 140,
    },
    {
      field: "taxNumber",
      headerName: "Податковий номер",
      flex: 0.9,
      minWidth: 160,
    },
    {
      field: "createdAt",
      headerName: "Створено",
      flex: 0.7,
      minWidth: 110,
    },
  ];

  return (
    <Box
      sx={{
        minHeight: "100vh",
        bgcolor: "#f3f4f6",
        py: 4,
        px: { xs: 2, md: 4 },
      }}
    >
      <Box sx={{ maxWidth: 1200, mx: "auto" }}>
        {/* Чіп секції */}
        <Box
          sx={{
            display: "inline-flex",
            px: 2,
            py: 0.5,
            borderRadius: 999,
            bgcolor: "#e5e7eb",
            mb: 2,
          }}
        >
          <Typography
            variant="caption"
            sx={{ letterSpacing: 0.8, fontWeight: 600, color: "#6b7280" }}
          >
            CLIENTS
          </Typography>
        </Box>

        {/* Основна картка */}
        <Box
          sx={{
            borderRadius: 5,
            bgcolor: "background.paper",
            boxShadow: "0px 18px 45px rgba(15,23,42,0.11)",
            p: { xs: 3, md: 4 },
          }}
        >
          {/* Header */}
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", md: "row" },
              justifyContent: "space-between",
              gap: 2,
              mb: 3,
            }}
          >
            <Box>
              <Typography
                variant="h6"
                sx={{ fontWeight: 600, mb: 0.5, color: "#020617" }}
              >
                Клієнти вашого бізнесу
              </Typography>
              <Typography
                variant="body2"
                sx={{ color: "#6b7280", maxWidth: 560 }}
              >
                Зберігай дані клієнтів, щоб швидко підставляти їх в інвойси та
                комунікацію.
              </Typography>
            </Box>

            <Box
              sx={{
                minWidth: 220,
                display: "flex",
                flexDirection: "column",
                alignItems: "flex-end",
                gap: 0.5,
              }}
            >
              <Typography
                variant="caption"
                sx={{ color: "#6b7280", textTransform: "uppercase" }}
              >
                Усього клієнтів
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{ fontWeight: 600, color: "#020617" }}
              >
                {clients.length}
              </Typography>
            </Box>
          </Box>

          <Box
            sx={{
              borderBottom: "1px solid rgba(148,163,184,0.4)",
              mb: 2.5,
            }}
          />

          {/* DataGrid */}
          <Box
            sx={{
              "& .MuiDataGrid-root": {
                border: "none",
              },
              "& .MuiDataGrid-columnHeaders": {
                bgcolor: "#f9fafb",
                borderBottom: "1px solid #e2e8f0",
              },
              "& .MuiDataGrid-row:hover": {
                bgcolor: "rgba(15,23,42,0.02)",
              },
              "& .MuiDataGrid-cell": {
                borderBottom: "1px solid #f1f5f9",
              },
            }}
          >
            <DataGrid
              autoHeight
              rows={rows}
              columns={columns}
              loading={loading}
              disableRowSelectionOnClick
              onRowDoubleClick={handleRowDoubleClick}
              pageSizeOptions={[5, 10, 25]}
              initialState={{
                pagination: {
                  paginationModel: { pageSize: 10, page: 0 },
                },
              }}
              localeText={{
                noRowsLabel: "Клієнтів поки немає",
              }}
            />
          </Box>

          {/* Низ картки з кнопкою */}
          <Box
            sx={{
              mt: 3,
              pt: 2,
              borderTop: "1px solid rgba(148,163,184,0.2)",
            }}
          >
            <Button
              fullWidth
              onClick={openCreateDialog}
              startIcon={<AddIcon />}
              sx={{
                borderRadius: 999,
                py: 1.4,
                fontWeight: 500,
                bgcolor: "#020617",
                color: "#f9fafb",
                textTransform: "none",
                "&:hover": {
                  bgcolor: "#020617",
                },
              }}
            >
              Додати клієнта
            </Button>

            <Typography
              variant="caption"
              sx={{
                display: "block",
                mt: 1.5,
                textAlign: "center",
                color: "#9ca3af",
              }}
            >
              Клієнти повʼязані з вашим акаунтом та організацією
            </Typography>
          </Box>
        </Box>
      </Box>

      {/* Діалог створення / редагування клієнта */}
      <Dialog
        open={dialogOpen}
        onClose={handleCloseDialog}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editingClient ? "Редагувати клієнта" : "Новий клієнт"}
        </DialogTitle>
        <DialogContent dividers>
          <Box sx={{ display: "flex", flexDirection: "column", gap: 2, mt: 1 }}>
            <TextField
              label="Назва клієнта *"
              size="small"
              fullWidth
              value={form.name}
              onChange={(e) => handleFormChange("name", e.target.value)}
            />
            <TextField
              label="Контактна особа"
              size="small"
              fullWidth
              value={form.contactName}
              onChange={(e) => handleFormChange("contactName", e.target.value)}
            />
            <TextField
              label="Email"
              size="small"
              fullWidth
              value={form.email}
              onChange={(e) => handleFormChange("email", e.target.value)}
            />
            <TextField
              label="Телефон"
              size="small"
              fullWidth
              value={form.phone}
              onChange={(e) => handleFormChange("phone", e.target.value)}
            />
            <TextField
              label="Податковий номер / ЄДРПОУ"
              size="small"
              fullWidth
              value={form.taxNumber}
              onChange={(e) => handleFormChange("taxNumber", e.target.value)}
            />
            <TextField
              label="Адреса"
              size="small"
              fullWidth
              value={form.address}
              onChange={(e) => handleFormChange("address", e.target.value)}
            />
            <TextField
              label="Нотатки"
              size="small"
              fullWidth
              multiline
              minRows={2}
              maxRows={4}
              value={form.notes}
              onChange={(e) => handleFormChange("notes", e.target.value)}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Скасувати</Button>
          <Button variant="contained" onClick={handleSubmit}>
            Зберегти
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={handleCloseSnackbar}
          severity={snackbarSeverity}
          sx={{ width: "100%" }}
        >
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ClientsPage;
