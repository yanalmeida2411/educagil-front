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

export interface CreateVideoPayload {
  title: string;
  youtube_url: string | undefined;
  video_id?: string;
  thumbnail: string | undefined;
  video_file: File | string | undefined;
  lesson: number;
}

export interface UpdateVideoPayload {
  id: number;
  title: string;
  uploaded_at: string;
  video_type: string;
  video_url: string | undefined;
  lesson: number;
  description: string;
  youtube_url?: string;
  thumbnail?: string;
  video_file?: File |string;
  video_id?: string;
}