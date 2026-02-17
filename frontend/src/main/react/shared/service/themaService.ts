import { apiClient } from "@/shared/service/api/client";

export type ThemaApi = {
  id: string;
  name: string;
  description?: string;
  createdAt?: string;
  updatedAt?: string;
};

export async function getThemen(): Promise<ThemaApi[]> {
  const { data } = await apiClient.get<ThemaApi[]>("/themas", {
    headers: { Accept: "application/json" },
  });
  return data;
}