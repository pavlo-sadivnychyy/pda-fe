import {
  Box,
  Card,
  CardContent,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import Link from "next/link";
import Image from "next/image";
import EmailOutlinedIcon from "@mui/icons-material/EmailOutlined";
import * as React from "react";

const linkSx = {
  color: "rgba(15, 23, 42, 0.62)",
  fontSize: 14,
  textDecoration: "none",
  px: 1,
  py: 0.5,
  borderRadius: 1,
  transition: "all 0.2s ease",
  "&:hover": {
    color: "#0f172a",
    backgroundColor: "rgba(15, 23, 42, 0.05)",
  },
};

export const Footer = () => {
  return (
    <Card
      elevation={4}
      sx={{
        mt: 3,
        borderRadius: 3,
        overflow: "hidden",
        border: "1px solid #eef2f7",
        boxShadow:
          "0px 20px 25px -5px rgba(0,0,0,0.06), 0px 10px 10px -5px rgba(0,0,0,0.04)",
        bgcolor: "#fff",
      }}
    >
      <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
        {/* container */}
        <Box sx={{ width: "100%" }}>
          {/* Row 1: logo + legal links */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={{ xs: 1.5, sm: 2 }}
            alignItems="center"
            justifyContent="space-between"
          >
            <Stack direction="row" spacing={1} alignItems="center">
              <Image
                src="/spravly-icon.png"
                alt="Spravly"
                width={32}
                height={32}
                priority
              />
              <Typography
                fontWeight={700}
                fontSize={14}
                sx={{ color: "#0f172a" }}
              >
                Spravly
              </Typography>
            </Stack>

            <Stack
              direction="row"
              alignItems="center"
              justifyContent={{ xs: "center", sm: "flex-end" }}
              sx={{ flexWrap: "wrap", gap: 0.75 }}
            >
              <Typography component={Link} href="/privacy-policy" sx={linkSx}>
                Політика конфіденційності
              </Typography>

              <Typography component={Link} href="/refund-policy" sx={linkSx}>
                Політика повернень
              </Typography>

              <Typography
                component={Link}
                href="/terms-and-conditions"
                sx={linkSx}
              >
                Умови користування
              </Typography>
            </Stack>
          </Stack>

          <Divider sx={{ my: 2, borderColor: "rgba(15, 23, 42, 0.08)" }} />

          {/* Row 2: support */}
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "center", sm: "flex-end" }}
            justifyContent="space-between"
          >
            {/* support card */}
            <Box
              component="a"
              href="mailto:ua.spravly@gmail.com"
              sx={{
                display: "flex",
                alignItems: "flex-start",
                gap: 1.25,
                px: 2,
                py: 1.25,
                borderRadius: 2,
                textDecoration: "none",
                backgroundColor: "rgba(15, 23, 42, 0.03)",
                border: "1px solid rgba(15, 23, 42, 0.06)",
                maxWidth: 420,
                transition: "all 0.2s ease",
                "&:hover": {
                  backgroundColor: "rgba(15, 23, 42, 0.06)",
                  borderColor: "rgba(15, 23, 42, 0.1)",
                },
              }}
            >
              <EmailOutlinedIcon
                sx={{
                  fontSize: 20,
                  mt: "2px",
                  color: "rgba(15, 23, 42, 0.65)",
                }}
              />

              <Box>
                <Typography
                  fontSize={13}
                  fontWeight={700}
                  sx={{ color: "#0f172a" }}
                >
                  Підтримка
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{ color: "rgba(15, 23, 42, 0.55)", lineHeight: 1.3 }}
                >
                  ua.spravly@gmail.com
                </Typography>

                <Typography
                  fontSize={12}
                  sx={{
                    mt: 0.5,
                    color: "rgba(15, 23, 42, 0.5)",
                  }}
                >
                  Якщо вам не вистачає якогось функціоналу — напишіть нам
                </Typography>
              </Box>
            </Box>

            {/* copyright */}
            <Typography
              fontSize={12}
              sx={{
                color: "rgba(15, 23, 42, 0.45)",
                textAlign: { xs: "center", sm: "right" },
              }}
            >
              © {new Date().getFullYear()} Spravly. All rights reserved.
            </Typography>
          </Stack>
        </Box>
      </CardContent>
    </Card>
  );
};
