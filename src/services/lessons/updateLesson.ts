
import { setupAPIClient } from "@/services/api/apiClient";
import { UpdateLessons } from "./types";

export const lessonsUpload = async (
  id: number,
  lessonData: UpdateLessons
) => {
  const api = setupAPIClient();

  return api.put(`/lessons/${id}/`, lessonData, { 
    headers: {
      "Content-Type": "application/json",
    },
  });
};