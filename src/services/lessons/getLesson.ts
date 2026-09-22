import { setupAPIClient } from "../api/apiClient";
import { Lessons } from "./types";

export const getAllLessons = async () => {
  const api = setupAPIClient();
  return api.get<Lessons[]>("/lessons/", {
    headers: {
      Accept: "application/json",
    },
  });
};