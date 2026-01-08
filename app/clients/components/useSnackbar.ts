"use client";

import { useCallback, useState } from "react";

export const useSnackbar = () => {
  const [open, setOpen] = useState(false);
  const [message, setMessage] = useState("");
  const [severity, setSeverity] = useState<"success" | "error">("success");

  const show = useCallback((msg: string, s: "success" | "error") => {
    setMessage(msg);
    setSeverity(s);
    setOpen(true);
  }, []);

  const close = useCallback(() => setOpen(false), []);

  return { open, message, severity, show, close };
};
