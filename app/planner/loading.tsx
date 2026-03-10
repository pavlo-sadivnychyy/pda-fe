import { Container, Skeleton, Stack } from "@mui/material";

export default function Loading() {
  return (
    <Container maxWidth="xl" sx={{ py: 4 }}>
      <Stack spacing={2}>
        <Skeleton variant="rounded" height={120} />
        <Skeleton variant="rounded" height={140} />
        <Skeleton variant="rounded" height={420} />
      </Stack>
    </Container>
  );
}
