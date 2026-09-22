import { setupAPIClient } from "../api/apiClient";
import { Video } from "./types";

export const getAllVideos = async () => {
  const api = setupAPIClient();
  return api.get<Video[]>("/videos/", {
    headers: {
      Accept: "application/json",
    },
  });
};