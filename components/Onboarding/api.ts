import { api } from "@/libs/axios";

export async function completeOnboarding() {
  await api.patch("/users/onboarding/complete");
}

// опціонально (якщо зробиш бекенд ендпоінт)
export async function resetOnboarding() {
  await api.patch("/users/onboarding/reset");
}
