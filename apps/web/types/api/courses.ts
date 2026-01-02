export type CourseCreateRequest = {
  name: string;
  description?: string;
};

export type CourseUpdateRequest = {
  name?: string;
  description?: string;
};

export type Course = {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  updateCount: number;
}

export type CourseDetails = {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  updateCount: number;
  materials?: [];
  quizzes?: [];
  feed?: [];
};
