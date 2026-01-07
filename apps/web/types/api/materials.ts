type FileMaterial = {
  uuid: string;
  name: string;
  description?: string;
  type: "file";
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
  created_at: string;
  updated_at: string;
  updateCount: number;
};

type UrlMaterial = {
  uuid: string;
  name: string;
  description?: string;
  type: "url";
  url: string;
  faviconUrl?: string;
  created_at: string;
  updated_at: string;
  updateCount: number;
};

export type Material = UrlMaterial | FileMaterial;

export type FileMaterialCreateRequest = {
  name?: string;
  description?: string;
  file: File;
};

export type UrlMaterialCreateRequest = {
  name: string;
  description?: string;
  url: string;
};

export type FileMaterialUpdateRequest = {
  name?: string;
  description?: string;
  file?: File;
};

export type UrlMaterialUpdateRequest = {
  name?: string;
  description?: string;
  url?: string;
};
