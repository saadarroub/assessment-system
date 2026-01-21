// src/main/react/api/reifegradModelApi.ts
import { apiClient } from "@/api/client";

// ====== Types ======
export interface ReifegradInterval {
  name: string;
  start: number;
  end: number;
  color?: string; // Hex-Farbe für das Intervall
}

export interface ReifegradModel {
  id: string;
  name: string;
  description: string;
  intervals: ReifegradInterval[];
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateReifegradModelDTO {
  name: string;
  description?: string;
  intervals: ReifegradInterval[];
}

export interface UpdateReifegradModelDTO {
  name: string;
  description?: string;
  intervals: ReifegradInterval[];
}

// ====== API Functions ======

/**
 * Alle Reifegradmodelle laden
 */
export async function getAllReifegradModels(): Promise<ReifegradModel[]> {
  const response = await apiClient.get("/reifegrad-models");
  return response.data;
}

/**
 * Ein Reifegradmodell per ID laden
 */
export async function getReifegradModelById(id: string): Promise<ReifegradModel> {
  const response = await apiClient.get(`/reifegrad-models/${id}`);
  return response.data;
}

/**
 * Neues Reifegradmodell erstellen
 */
export async function createReifegradModel(data: CreateReifegradModelDTO): Promise<ReifegradModel> {
  const response = await apiClient.post("/reifegrad-models", data);
  return response.data;
}

/**
 * Bestehendes Reifegradmodell aktualisieren
 */
export async function updateReifegradModel(id: string, data: UpdateReifegradModelDTO): Promise<ReifegradModel> {
  const response = await apiClient.put(`/reifegrad-models/${id}`, data);
  return response.data;
}

/**
 * Reifegradmodell löschen
 */
export async function deleteReifegradModel(id: string): Promise<void> {
  await apiClient.delete(`/reifegrad-models/${id}`);
}
