export interface Video {
  id: number;
  title: string;
  youtube_url: string | undefined;
  uploaded_at: string;
  video_id: string;
  thumbnail: string;
  video_file: string;
  video_type: string;
  video_url: string | undefined;
  lesson: number;
}

export interface Lesson {
  id: number;
  title: string;
  description: string;
}

export interface CreateVideoPayload {
  title: string;
  youtube_url: string | undefined;
  video_id: string;
  thumbnail: string;
  video_file: File;
  lesson: number;
}

export interface UpdateVideoPayload {
  lesson?: number;
  title?: string;
  video_file?: string;
}

export interface CreateLessonPayload {
  title: string;
  description: string;
}

export interface UpdateLessonPayload {
  title?: string;
  description?: string;
}

export interface ApiErrorResponse {
  message?: string;
  error?: string;
  detail?: string;
  [key: string]: any;
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  status?: number;
  rawError?: any;
}
