import { setupAPIClient } from "@/services/api/apiClient";

export const lessonDelete = async (id: number) => {
  const api = setupAPIClient();
  return api.delete(`/lessons/${id}`);
};