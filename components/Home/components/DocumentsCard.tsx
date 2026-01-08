"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  Divider,
  Stack,
  Typography,
} from "@mui/material";
import DescriptionIcon from "@mui/icons-material/Description";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import { useRouter } from "next/navigation";

export function DocumentsCard() {
  const router = useRouter();

  return (
    <Card elevation={3} sx={{ borderRadius: 3, mb: 3 }}>
      <CardHeader
        avatar={<DescriptionIcon sx={{ color: "#6b7280" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Документи
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Завантажуйте договори, описи, регламенти.
          </Typography>
        }
      />
      <CardContent sx={{ pt: 1 }}>
        <Button
          onClick={() => router.push("/knowledge-base")}
          fullWidth
          variant="outlined"
          startIcon={<CloudUploadIcon />}
          sx={{
            mb: 1.5,
            textTransform: "none",
            borderRadius: 999,
            borderColor: "#dadce0",
            color: "#374151",
            bgcolor: "#ffffff",
            "&:hover": { borderColor: "#c4c6cb", bgcolor: "#fafafa" },
          }}
        >
          Завантажити документ
        </Button>

        <Divider sx={{ my: 1.5 }} />

        <Typography variant="body2" sx={{ color: "text.secondary", mb: 0.5 }}>
          Останні документи
        </Typography>
        <Stack spacing={0.5}>
          <Typography variant="body2">• Договір надання послуг.docx</Typography>
          <Typography variant="body2">
            • Політика повернення коштів.pdf
          </Typography>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            • Опис пакету “Premium”.txt
          </Typography>
        </Stack>
      </CardContent>
    </Card>
  );
}
