import { setupAPIClient } from "@/services/api/apiClient";
import { CreateLessons, Lessons } from "./types";

export const uploadLessons = async (data: Lessons) => {
  const api = setupAPIClient();

  return api.post<CreateLessons>("/lessons/", data, {
    headers: {
      "Content-Type": "application/json",
    },
  });
};