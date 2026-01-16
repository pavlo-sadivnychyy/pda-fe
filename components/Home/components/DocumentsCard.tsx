"use client";

import {
  Box,
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
import SearchIcon from "@mui/icons-material/Search";
import { useRouter } from "next/navigation";

type Props = {
  dragHandle?: React.ReactNode; // ✅ NEW
};

export function DocumentsCard({ dragHandle }: Props) {
  const router = useRouter();

  return (
    <Card data-onb="card-documents" elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<DescriptionIcon sx={{ color: "#6b7280" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Документи
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Всі файли та згенеровані документи в одному місці.
          </Typography>
        }
        // ✅ Хваталка в правому кутку хедера
        action={<Box sx={{ mr: 1 }}>{dragHandle}</Box>}
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

        <Stack spacing={1}>
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Тут зберігаються{" "}
            <strong style={{ color: "black" }}>
              всі завантажені вами файли
            </strong>
            , а також
            <strong style={{ color: "black" }}>
              {" "}
              згенеровані інвойси, акти
            </strong>{" "}
            і<strong style={{ color: "black" }}> комерційні пропозиції</strong>.
          </Typography>

          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Використовуйте <strong style={{ color: "black" }}>пошук</strong>,
            щоб
            <strong style={{ color: "black" }}>
              {" "}
              миттєво знайти потрібний документ
            </strong>{" "}
            за назвою або змістом.
          </Typography>

          <Box sx={{ display: "flex", alignItems: "center", gap: 0.8 }}>
            <SearchIcon color="warning" sx={{ fontSize: 18 }} />
            <Typography variant="body2" sx={{ color: "text.secondary" }}>
              Жодних пошуків у пошті чи чатах — все впорядковано тут.
            </Typography>
          </Box>
        </Stack>
      </CardContent>
    </Card>
  );
}
