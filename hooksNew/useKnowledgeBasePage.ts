"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";

import {
  useDeleteKnowledgeBaseDocument,
  useKnowledgeBaseDocuments,
  useUploadKnowledgeBaseDocument,
} from "@/hooks/useKnowledgeBaseDocuments";
import { useKnowledgeBaseSearch } from "@/hooks/useKnowledgeBaseSearch";
import { useKnowledgeBaseBootstrap } from "@/hooks/useKnowledgeBaseBootstrap";

type SnackbarState = {
  open: boolean;
  message: string;
  severity: "success" | "error";
};

export function useKnowledgeBasePage() {
  const {
    clerkUser,
    data: bootstrapData,
    isLoading: isBootstrapLoading,
    error: bootstrapError,
    isUserLoaded,
    isUserDataLoading,
    userDataError,
  } = useKnowledgeBaseBootstrap();

  const organization = bootstrapData?.organization ?? null;
  const apiUser = bootstrapData?.apiUser ?? null;

  const hasOrg = !!organization?.id;

  // ✅ only fetch docs if org exists
  const {
    data: docsData,
    isLoading: docsLoading,
    error: docsError,
  } = useKnowledgeBaseDocuments(hasOrg ? organization.id : undefined);

  const documents = useMemo(() => docsData?.data?.items ?? [], [docsData]);

  const {
    mutate: uploadDocument,
    isPending: isUploading,
    error: uploadError,
  } = useUploadKnowledgeBaseDocument();

  const { mutate: deleteDocument, isPending: isDeleting } =
    useDeleteKnowledgeBaseDocument();

  // ---- search + debounce ----
  const [search, setSearch] = useState("");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const id = setTimeout(() => setSearchQuery(search.trim()), 400);
    return () => clearTimeout(id);
  }, [search]);

  const canSearch = hasOrg && !!searchQuery;

  const {
    data: searchData,
    isLoading: isSearchLoading,
    error: searchError,
  } = useKnowledgeBaseSearch(
    canSearch ? organization.id : undefined,
    searchQuery,
  );

  const searchResults = useMemo(() => searchData?.items ?? [], [searchData]);

  // ---- dialog form state ----
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [tags, setTags] = useState("");
  const [file, setFile] = useState<File | null>(null);

  // ✅ stable file picker refs
  const dialogInputRef = useRef<HTMLInputElement | null>(null);
  const openDialogPicker = () => dialogInputRef.current?.click();

  const quickInputRef = useRef<HTMLInputElement | null>(null);
  const openQuickPicker = () => quickInputRef.current?.click();

  // ---- snackbar ----
  const [snackbar, setSnackbar] = useState<SnackbarState>({
    open: false,
    message: "",
    severity: "success",
  });

  const openSnackbar = (next: Omit<SnackbarState, "open">) =>
    setSnackbar({ open: true, ...next });

  const closeSnackbar = () => setSnackbar((prev) => ({ ...prev, open: false }));

  // ---- dialog handlers ----
  const openDialog = () => setIsDialogOpen(true);

  const closeDialog = () => {
    if (isUploading) return;
    setIsDialogOpen(false);
  };

  const onDialogFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0] ?? null;
    setFile(f);
    e.target.value = ""; // ✅ allows picking same file again
  };

  const resetDialog = () => {
    setTitle("");
    setDescription("");
    setTags("");
    setFile(null);
  };

  const handleCreate = () => {
    if (!hasOrg || !apiUser || !file) return;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("organizationId", organization.id);
    formData.append("createdById", apiUser.id);
    if (title) formData.append("title", title);
    if (description) formData.append("description", description);
    if (tags) formData.append("tags", tags);
    formData.append("language", "uk");

    uploadDocument(
      { organizationId: organization.id, formData },
      {
        onSuccess: () => {
          resetDialog();
          setIsDialogOpen(false);
          openSnackbar({
            message: "Документ додано до бази знань",
            severity: "success",
          });
        },
        onError: (error: any) => {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              "Не вдалося завантажити документ",
            severity: "error",
          });
        },
      },
    );
  };

  // ---- quick upload ----
  const uploadOneQuick = (f: File) => {
    if (!hasOrg || !apiUser) return;

    const formData = new FormData();
    formData.append("file", f);
    formData.append("organizationId", organization.id);
    formData.append("createdById", apiUser.id);
    formData.append("language", "uk");

    uploadDocument(
      { organizationId: organization.id, formData },
      {
        onSuccess: () => {
          openSnackbar({
            message: `Завантажено: ${f.name}`,
            severity: "success",
          });
        },
        onError: (error: any) => {
          openSnackbar({
            message:
              error?.response?.data?.message ||
              `Не вдалося завантажити: ${f.name}`,
            severity: "error",
          });
        },
      },
    );
  };

  const onQuickFilesSelected = (e: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = "";
    if (!files.length) return;
    files.forEach(uploadOneQuick);
  };

  // ---- delete ----
  const handleDelete = (id: string) => {
    if (!hasOrg) return;

    deleteDocument(
      { id, organizationId: organization.id },
      {
        onSuccess: () =>
          openSnackbar({ message: "Документ видалено", severity: "success" }),
        onError: (error: any) => {
          openSnackbar({
            message:
              error?.response?.data?.message || "Не вдалося видалити документ",
            severity: "error",
          });
        },
      },
    );
  };

  // ✅ single loading flag for the page gate
  const isGateLoading =
    !isUserLoaded || isUserDataLoading || isBootstrapLoading;

  return {
    clerkUser,
    organization,
    apiUser,

    hasOrg,
    isGateLoading,

    isBootstrapLoading,
    bootstrapError,
    userDataError,

    documents,
    docsLoading,
    docsError,

    search,
    setSearch,
    searchQuery,
    searchResults,
    isSearchLoading,
    searchError,

    isDialogOpen,
    openDialog,
    closeDialog,
    title,
    setTitle,
    description,
    setDescription,
    tags,
    setTags,
    file,
    onDialogFileChange,
    handleCreate,
    isUploading,
    uploadError,

    dialogInputRef,
    openDialogPicker,

    quickInputRef,
    openQuickPicker,
    onQuickFilesSelected,

    handleDelete,
    isDeleting,

    snackbar,
    closeSnackbar,
  };
}
