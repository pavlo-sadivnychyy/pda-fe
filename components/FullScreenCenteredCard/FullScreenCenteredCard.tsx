import { Box, Card } from "@mui/material";
import { ReactNode } from "react";

export const FullScreenCenteredCard = ({
  children,
}: {
  children: ReactNode;
}) => (
  <Box
    sx={{
      height: "100vh",
      bgcolor: "#f3f4f6",
      display: "flex",
      justifyContent: "center",
      alignItems: "center",
      px: 2,
      py: 2,
      overflow: "hidden", // сторінка не скролиться
    }}
  >
    <Card
      elevation={4}
      sx={{
        width: "100%",
        maxWidth: 1400,
        borderRadius: 4,
        boxShadow: "0 18px 45px rgba(15, 23, 42, 0.18)",
        overflow: "hidden",
        display: "flex",
        flexDirection: "column",
        maxHeight: "100%", // картка вписується в екран
      }}
    >
      {children}
    </Card>
  </Box>
);
