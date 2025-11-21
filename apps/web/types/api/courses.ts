export interface CourseCreateRequest {
  name: string;
  description?: string;
}

export interface CourseUpdateRequest {
  name?: string;
  description?: string;
}

export interface CourseDetails {
  uuid: string;
  name: string;
  description?: string;
  materials?: [];
}
