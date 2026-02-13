"use client";

import * as React from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Divider,
  IconButton,
  Stack,
  Tooltip,
  Typography,
} from "@mui/material";
import BusinessIcon from "@mui/icons-material/Business";
import WorkspacePremiumIcon from "@mui/icons-material/WorkspacePremium";
import LogoutIcon from "@mui/icons-material/Logout";
import ArrowForwardIosIcon from "@mui/icons-material/ArrowForwardIos";
import { useClerk, useUser } from "@clerk/nextjs";
import { useRouter } from "next/navigation";
import GavelRoundedIcon from "@mui/icons-material/GavelRounded";

type PlanId = "FREE" | "STARTER" | "PRO" | "BUSINESS" | "BASIC" | string;

type Props = {
  firstName?: string | null;

  organizationName?: string | null;
  hasOrganization?: boolean;

  planId?: PlanId | null;
};

function planLabel(planId?: PlanId | null) {
  const id = (planId ?? "FREE").toString().toUpperCase();
  if (id === "FREE") return "FREE";
  if (id === "BASIC") return "BASIC";
  if (id === "STARTER") return "STARTER";
  if (id === "PRO") return "PRO";
  if (id === "BUSINESS") return "BUSINESS";
  return id;
}

export function HomeHeader({
  firstName,
  organizationName,
  hasOrganization,
  planId,
}: Props) {
  const router = useRouter();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();

  const fullName =
    user?.fullName ||
    [user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
    firstName ||
    "👋";

  const email = user?.primaryEmailAddress?.emailAddress ?? null;
  const avatarUrl = user?.imageUrl ?? undefined;

  const plan = planLabel(planId);
  const orgTitle =
    hasOrganization && organizationName?.trim()
      ? organizationName.trim()
      : "Без організації";

  return (
    <Box sx={{ mb: 3 }}>
      {/* Header #1: Welcome */}
      <Card
        elevation={4}
        sx={{
          borderRadius: 3,
          overflow: "hidden",
          border: "1px solid #eef2f7",
          boxShadow:
            "0px 20px 25px -5px rgba(0,0,0,0.06), 0px 10px 10px -5px rgba(0,0,0,0.04)",
          bgcolor: "#fff",
        }}
      >
        <CardContent sx={{ p: 3 }}>
          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={2}
            alignItems={{ xs: "flex-start", sm: "center" }}
            justifyContent="space-between"
          >
            <Box sx={{ minWidth: 0 }}>
              <Typography
                variant="h6"
                sx={{ fontWeight: 900, letterSpacing: "-0.02em", mb: 0.5 }}
              >
                Привіт, {firstName ?? "👋"}
              </Typography>

              <Typography
                variant="body2"
                sx={{ color: "text.secondary", maxWidth: 720 }}
              >
                Чим сьогодні допомогти?
              </Typography>
            </Box>

            {/* компактний юзер справа, без кнопок */}
            {isSignedIn && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  gap: 1.2,
                  px: 1.25,
                  py: 0.9,
                  borderRadius: 999,
                  border: "1px solid #e5e7eb",
                  bgcolor: "#fff",
                  minWidth: 0,
                }}
              >
                <Avatar src={avatarUrl} sx={{ width: 34, height: 34 }}>
                  {(fullName ?? "U").slice(0, 1).toUpperCase()}
                </Avatar>

                <Box sx={{ minWidth: 0 }}>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 900,
                      lineHeight: 1.15,
                      whiteSpace: "nowrap",
                      overflow: "hidden",
                      textOverflow: "ellipsis",
                      maxWidth: 220,
                    }}
                  >
                    {fullName}
                  </Typography>
                  {email && (
                    <Typography
                      variant="caption"
                      sx={{
                        color: "text.secondary",
                        lineHeight: 1.1,
                        whiteSpace: "nowrap",
                        overflow: "hidden",
                        textOverflow: "ellipsis",
                        display: "block",
                        maxWidth: 220,
                      }}
                    >
                      {email}
                    </Typography>
                  )}
                </Box>
              </Box>
            )}
          </Stack>
        </CardContent>

        <Box
          sx={{
            height: 6,
            bgcolor: "rgba(250, 204, 21, 0.18)",
            backgroundImage:
              "linear-gradient(135deg, rgba(249,115,22,0.35) 0%, rgba(234,179,8,0.35) 100%)",
          }}
        />
      </Card>

      <Card
        elevation={0}
        sx={{
          borderRadius: 3,
          mt: 1.5,
          bgcolor: "#fff",
          border: "1px solid #e5e7eb",
        }}
      >
        <CardContent
          sx={{
            px: { xs: 1.25, sm: 2 },
            py: "16px !important",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: { xs: "column", lg: "row" }, // ✅ tablet як mobile
              alignItems: { xs: "stretch", lg: "center" },
              justifyContent: { xs: "flex-start", lg: "space-between" },
              gap: { xs: 1.25, lg: 2 },
              minWidth: 0,
            }}
          >
            {/* LEFT: ORG + PROFILE */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                gap: 1,
                minWidth: 0,
                flex: { lg: "1 1 auto" },
                flexWrap: { xs: "wrap", lg: "nowrap" },
              }}
            >
              <Tooltip title={"Умови користування"}>
                <GavelRoundedIcon
                  onClick={() => router.push("/terms-and-conditions")}
                  sx={{ fontSize: 18, cursor: "pointer" }}
                />
              </Tooltip>
              <Chip
                icon={<BusinessIcon />}
                label={orgTitle}
                variant="outlined"
                onClick={() => router.push("/organization")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 999,
                  fontWeight: 900,
                  borderColor: "#e5e7eb",
                  bgcolor: "#fff",
                  maxWidth: { xs: "100%", lg: 360 }, // ✅ тільки desktop ліміт
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "fit-content",
                  }, // ✅ tablet = 100%
                  justifyContent: "flex-start",
                  "& .MuiChip-label": {
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    maxWidth: "100%",
                  },
                }}
              />

              <Button
                variant="outlined"
                onClick={() => router.push("/organization")}
                endIcon={<ArrowForwardIosIcon sx={{ fontSize: 14 }} />}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  fontWeight: 900,
                  px: 1.25,
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "fit-content",
                  },
                  whiteSpace: "nowrap",

                  // ✅ default
                  color: "#111827",
                  borderColor: "#e5e7eb",
                  bgcolor: "#fff",
                  "&:hover": {
                    bgcolor: "rgba(17,24,39,0.04)",
                    borderColor: "#e5e7eb",
                  },

                  // ✅ highlight when no org
                  ...(hasOrganization
                    ? {}
                    : {
                        borderColor: "rgba(245, 158, 11, 0.85)", // amber
                        bgcolor: "rgba(245, 158, 11, 0.08)",
                        color: "#92400e",
                        boxShadow:
                          "0 0 0 4px rgba(245, 158, 11, 0.14), 0 10px 22px rgba(245, 158, 11, 0.18)",
                        position: "relative",
                        "&:hover": {
                          bgcolor: "rgba(245, 158, 11, 0.14)",
                          borderColor: "rgba(245, 158, 11, 1)",
                        },
                        // subtle pulse ring
                        "@keyframes orgPulse": {
                          "0%": {
                            boxShadow: "0 0 0 0 rgba(245, 158, 11, 0.35)",
                          },
                          "70%": {
                            boxShadow: "0 0 0 10px rgba(245, 158, 11, 0)",
                          },
                          "100%": {
                            boxShadow: "0 0 0 0 rgba(245, 158, 11, 0)",
                          },
                        },
                        animation: "orgPulse 2.2s ease-out infinite",
                      }),
                }}
              >
                <Box
                  sx={{
                    display: "flex",
                    alignItems: "center",
                    gap: 1,
                    width: "100%",
                    justifyContent: { xs: "space-between", lg: "center" },
                  }}
                >
                  <span>Профіль організації</span>

                  {!hasOrganization && (
                    <Chip
                      size="small"
                      label="Потрібно"
                      sx={{
                        height: 22,
                        fontWeight: 900,
                        bgcolor: "rgba(245, 158, 11, 0.18)",
                        border: "1px solid rgba(245, 158, 11, 0.45)",
                        color: "#92400e",
                        "& .MuiChip-label": { px: 1 },
                      }}
                    />
                  )}
                </Box>
              </Button>
            </Box>

            <Divider
              flexItem
              orientation="vertical"
              sx={{
                display: { xs: "none", lg: "block" }, // ✅ показувати тільки на desktop
                borderColor: "#e5e7eb",
                mx: 0.5,
              }}
            />

            {/* RIGHT: PLAN + MANAGE + LOGOUT */}
            <Box
              sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: { xs: "stretch", lg: "flex-end" },
                gap: 1,
                flexWrap: { xs: "wrap", lg: "nowrap" },
                flex: { lg: "0 0 auto" },
              }}
            >
              <Chip
                icon={<WorkspacePremiumIcon />}
                label={`План: ${plan}`}
                onClick={() => router.push("/pricing")}
                sx={{
                  cursor: "pointer",
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: "rgba(17,24,39,0.06)",
                  color: "#111827",
                  "& .MuiChip-icon": { color: "#111827" },
                  width: {
                    xs: "100%",
                    sm: "100%",
                    md: "100%",
                    lg: "fit-content",
                  }, // ✅ tablet = 100%
                  justifyContent: "flex-start",
                }}
              />

              <Button
                variant="contained"
                onClick={() => router.push("/pricing")}
                sx={{
                  textTransform: "none",
                  borderRadius: 999,
                  fontWeight: 900,
                  bgcolor: "#111827",
                  color: "#fff",
                  boxShadow: "none",
                  "&:hover": { bgcolor: "#1f2937", boxShadow: "none" },
                  width: { xs: "100%", sm: "100%", md: "100%", lg: "auto" },
                  minWidth: { lg: 220 }, // ✅ тільки desktop
                  whiteSpace: "nowrap",
                }}
              >
                Керувати планом
              </Button>

              {isSignedIn && (
                <IconButton
                  onClick={() => signOut({ redirectUrl: "/" })}
                  sx={{
                    width: 40,
                    height: 40,
                    borderRadius: 999,
                    border: "1px solid #fecaca",
                    color: "#b91c1c",
                    bgcolor: "#fff",
                    "&:hover": { bgcolor: "#fef2f2", borderColor: "#fca5a5" },
                    alignSelf: { xs: "flex-start", lg: "center" },
                  }}
                >
                  <LogoutIcon fontSize="small" />
                </IconButton>
              )}
            </Box>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
}
