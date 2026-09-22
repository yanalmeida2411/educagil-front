import { setupAPIClient } from "@/services/api/apiClient";
import { CreateLessons } from "./types";

export const uploadLessons = async (data: CreateLessons) => {
  const api = setupAPIClient();

  return api.post<CreateLessons>("/lessons/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};