import { lessonDelete } from "./deleteLesson";
import { getAllLessons } from "./getLesson";
import { uploadLessons } from "./uploadLesson";
import { lessonsUpload} from "./updateLesson"
import { handleApiError, setupAPIClient } from "@/services/api/api";
import { ApiResponse } from "../types";
import { CreateLessons, Lessons, UpdateLessons } from "./types";
import { Video } from "../videos/types";

const getLessons = async (): Promise<ApiResponse<Lessons[]>> => {
  try {
    const response = await getAllLessons();
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    return {
      success: false,
      error: errorMessage,
      status: (error as any)?.response?.status,
      rawError: error,
    };
  }
};

const createLessons = async (
  videoData: Lessons
): Promise<ApiResponse<CreateLessons>> => {
  try {
    const response = await uploadLessons(videoData);
    return {
      success: true,
      data: response.data,
      status: response.status,
    };
  } catch (error: unknown) {
    const errorMessage = handleApiError(error);
    return {
      success: false,
      error: errorMessage,
      status: (error as any)?.response?.status,
      rawError: error,
    };
  }
};

export const updateLesson = async (id: number, data: { title: string; description: string }) => {
  const api = setupAPIClient();
  try {
    const response = await api.put(`/lessons/${id}/`, data);
    return { success: true, data: response.data };
  } catch (error: any) {
    return {
      success: false,
      data: null,
      rawError: error,
    };
  }
};


const deleteLesson = async (id: number): Promise<ApiResponse<void>> => {
  try {
    const response = await lessonDelete(id);
    return {
      success: true,
      status: response.status,
    };
  } catch (error: unknown) {
    return {
      success: false,
      error: handleApiError(error),
      status: (error as any)?.response?.status,
      rawError: error,
    };
  }
};


export const getLessonById = async (id: number) => {
  const apiClient = setupAPIClient();
  try {
    const response = await apiClient.get(`/lessons/${id}/`);
    return { success: true, data: response.data };
  } catch (error) {
    return { success: false, error };
  }
};



export const lessonsService = {
  getLessons,
  createLessons,
  deleteLesson,
  updateLesson,
  getLessonById
}
