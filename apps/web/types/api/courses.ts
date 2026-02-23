export type CourseCreateRequest = {
  name: string;
  description?: string;
  theme?: string;
  openedAt?: string;
  closedAt?: string; 
};

export type CourseUpdateRequest = {
  name?: string;
  description?: string;
  theme?: string;
  openedAt?: string;
  closedAt?: string;
};

export type CourseStateUpdateRequest = {
  state: "draft" | "life" | "archived" | "paused";
};

export type Course = {
  uuid: string;
  name: string;
  description?: string;
  theme?: string;
  state: "draft" | "life" | "archived" | "paused";
  openedAt: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
  updateCount: number;
}

export type CourseDetails = {
  uuid: string;
  name: string;
  description?: string;
  theme?: string;
  state: "draft" | "life" | "archived" | "paused";
  openedAt: string;
  closedAt: string;
  createdAt: string;
  updatedAt: string;
  updateCount: number;
  modules?: [];
  feed?: [];
};
