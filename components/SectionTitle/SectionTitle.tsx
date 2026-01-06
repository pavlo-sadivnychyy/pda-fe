import { Typography } from "@mui/material";
import {ReactNode} from "react";

export const SectionTitle = ({ children }: { children: ReactNode }) => (
    <Typography
        variant="subtitle2"
        sx={{
            mb: 1,
            color: "#6b7280",
            textTransform: "uppercase",
            fontSize: 11,
            letterSpacing: 0.5,
            fontWeight: 600,
        }}
    >
        {children}
    </Typography>
);