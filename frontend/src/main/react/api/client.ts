// src/main/react/api/client.ts
import axios from "axios";

export const apiClient = axios.create({
  baseURL: "http://localhost:8080/api",

  headers: {
    "Content-Type": "application/json",
  },
});
