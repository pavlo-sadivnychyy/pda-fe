"use client";

import {
  Button,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  Typography,
} from "@mui/material";
import HistoryIcon from "@mui/icons-material/History";

export function ActivityCard() {
  return (
    <Card elevation={3} sx={{ borderRadius: 3 }}>
      <CardHeader
        avatar={<HistoryIcon sx={{ color: "#6b7280" }} />}
        title={
          <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
            Ваша остання активність
          </Typography>
        }
        subheader={
          <Typography variant="body2" sx={{ color: "text.secondary" }}>
            Швидкий доступ до останніх дій.
          </Typography>
        }
        sx={{ pb: 0 }}
      />
      <CardContent sx={{ pt: 1 }}>
        <List dense>
          <ListItem divider>
            <ListItemText
              primary="Діалог з асистентом: Ідеї для весняної акції"
              secondary="5 хвилин тому"
            />
          </ListItem>
          <ListItem divider>
            <ListItemText
              primary="Згенерований документ: Комерційна пропозиція для нового клієнта"
              secondary="Сьогодні, 10:21"
            />
          </ListItem>
          <ListItem>
            <ListItemText
              primary="Створений контент-план на тиждень"
              secondary="Вчора"
            />
          </ListItem>
        </List>

        <Button
          size="small"
          sx={{ mt: 1, textTransform: "none", color: "#374151" }}
          startIcon={<HistoryIcon sx={{ fontSize: 18 }} />}
        >
          Переглянути всю історію
        </Button>
      </CardContent>
    </Card>
  );
}
