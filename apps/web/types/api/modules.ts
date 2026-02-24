export type Module = {
  uuid: string;
  name: string;
  description?: string;
  idx: number;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  updateCount: number;
};

export type ModulesRecieve = {
  courseName: string;
  count: number;
  description: string;
  modules: Module[];
};

export type ModuleCreateRequest = {
  name: string;
  description?: string;
};

export type ModuleUpdateRequest = {
  name?: string;
  description?: string;
  state?: "open" | "closed";
};

export type ModuleDetails = {
  uuid: string;
  name: string;
  description?: string;
  idx: number;
  state: "open" | "closed";
  createdAt: string;
  updatedAt: string;
  updateCount: number;
  materials?: [];
  quizzes?: [];
};
