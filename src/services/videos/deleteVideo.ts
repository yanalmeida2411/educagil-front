import { setupAPIClient } from "@/services/api/apiClient";

export const videoDelete = async (id: number) => {
  const api = setupAPIClient();
  return api.delete(`/videos/${id}`);
};