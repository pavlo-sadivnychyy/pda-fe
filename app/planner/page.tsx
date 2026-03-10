import { Container } from "@mui/material";
import { PlannerPageView } from "./components/PlannerPageView";

export default function PlannerPage() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <PlannerPageView />
    </Container>
  );
}
