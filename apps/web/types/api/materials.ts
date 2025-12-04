type FileMaterial = {
  uuid: string;
  name: string;
  description?: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
};

type UrlMaterial = {
  uuid: string;
  name: string;
  description?: string;
  url: string;
  faviconUrl?: string;
};

export type Material = {
  material: UrlMaterial | FileMaterial;
};

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
