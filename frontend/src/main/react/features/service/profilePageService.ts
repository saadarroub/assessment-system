import { apiClient } from "@/api/client";

/* Typen*/

export type ApiUser = {
  id: string;
  name: string;
  email: string;
  phone?: string | null;
  street?: string | null;
  postalCode?: string | null;
  city?: string | null;
  country?: string | null;
  profileImagePath?: string | null;
};

export type UpdateProfileRequest = {
  name: string;
  email: string;
  phone?: string;
  street?: string;
  postalCode?: string;
  city?: string;
  country?: string;
  currentPassword?: string | null; 
};

export type ChangePasswordRequest = {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
};

/*  API Calls*/

/** 1User-Daten abrufen */
export async function getUserProfile(userId: string): Promise<ApiUser> {
  const { data } = await apiClient.get<ApiUser>(`/users/${userId}`, {
    headers: { Accept: "application/json" },
  });

  return data;
}

/**  Profil aktualisieren */
export async function updateUserProfile(
  userId: string,
  body: UpdateProfileRequest
): Promise<void> {
  await apiClient.put(`/users/${userId}/profile`, body, {
    headers: { "Content-Type": "application/json" },
  });
}

/** Passwort ändern */
export async function changePassword(
  userId: string,
  body: ChangePasswordRequest
): Promise<void> {
  await apiClient.put(`/users/${userId}/password`, body, {
    headers: { "Content-Type": "application/json" },
  });
}

/** Avatar hochladen (Multipart) */
export async function uploadAvatar(
  userId: string,
  file: File
): Promise<string | null> {
  const formData = new FormData();
  formData.append("file", file);

  const resp = await apiClient.post(`/users/${userId}/avatar`, formData, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return resp?.data?.profileImagePath ?? null;
}

/** Avatar löschen */
export async function deleteAvatar(userId: string): Promise<void> {
  await apiClient.delete(`/users/${userId}/avatar`);
}

/**  Avatar URL generieren */
const RAW_BASE_URL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (apiClient.defaults.baseURL as string | undefined) ??
  "/api"; // Fallback

export function buildAvatarUrl(profileImagePath?: string | null) {
  if (!profileImagePath) return null;

  // z.B. RAW_BASE_URL = "http://localhost:8080/api"
  const base = RAW_BASE_URL.replace(/\/$/, ""); // letztes "/" weg
  return `${base}/files/avatars/${profileImagePath}`;
  // ergibt z.B. "http://localhost:8080/api/files/avatars/550e8400_...jpg"
}
