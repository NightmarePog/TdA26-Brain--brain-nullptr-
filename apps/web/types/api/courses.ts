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
  materials?: [];
};
