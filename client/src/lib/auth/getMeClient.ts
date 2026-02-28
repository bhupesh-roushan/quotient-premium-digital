import { apiClient } from "@/lib/api/client";

export type MeResponse = {
  ok: boolean;
  user?: { id: string; name: string; email: string; isCreator: boolean };
};

export async function getMeClient() {
  try {
    const response = await apiClient.get<MeResponse>("/api/auth/me");
    return response.data;
  } catch {
    return { ok: false } as MeResponse;
  }
}
