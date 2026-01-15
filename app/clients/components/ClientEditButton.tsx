"use client";

import { IconButton, Tooltip } from "@mui/material";
import ModeEditOutlineIcon from "@mui/icons-material/ModeEditOutline";

export const ClientEditButton = ({ onClick }: { onClick: () => void }) => {
  return (
    <Tooltip title="Редагувати клієнта">
      <span>
        <IconButton
          size="small"
          onClick={onClick}
          sx={{
            border: "1px solid #0f172a",
            color: "#334155", // slate-700
            bgcolor: "#ffffff",

            "&:hover": {
              bgcolor: "#f8fafc",
              borderColor: "#cbd5e1",
              color: "#0f172a", // slate-900
            },

            "&.Mui-disabled": {
              borderColor: "#f1f5f9",
              color: "#94a3b8",
            },
          }}
        >
          <ModeEditOutlineIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};
