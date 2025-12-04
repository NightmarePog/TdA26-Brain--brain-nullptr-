export type CourseCreateRequest = {
  name: string;
  description?: string;
};

export type CourseUpdateRequest = {
  name?: string;
  description?: string;
};

export type CourseDetails = {
  uuid: string;
  name: string;
  description?: string;
  created_at: string;
  updated_at: string;
  materials?: [];
};
