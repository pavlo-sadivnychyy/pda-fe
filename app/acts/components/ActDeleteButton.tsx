"use client";

import DeleteOutlineIcon from "@mui/icons-material/DeleteOutline";
import { IconButton, Tooltip } from "@mui/material";

export const ActDeleteButton = ({
  disabled,
  onClick,
}: {
  disabled?: boolean;
  onClick: () => void;
}) => {
  return (
    <Tooltip title="Видалити акт">
      <span>
        <IconButton
          size="small"
          disabled={disabled}
          onClick={onClick}
          sx={{
            border: "1px solid rgba(220,38,38,0.25)",
            color: "#b91c1c",
            "&:hover": {
              bgcolor: "rgba(220,38,38,0.06)",
              borderColor: "rgba(185,28,28,0.45)",
            },
            "&.Mui-disabled": {
              borderColor: "#fee2e2",
              color: "#fca5a5",
            },
          }}
        >
          <DeleteOutlineIcon fontSize="small" />
        </IconButton>
      </span>
    </Tooltip>
  );
};
