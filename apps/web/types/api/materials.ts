enum MaterialType {
  FILE_MATERIAL,
  URL_MATERIAL,
}

type FileMaterial = {
  uuid: string;
  type: MaterialType.FILE_MATERIAL;
  name: string;
  description?: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
};

type UrlMaterial = {
  uuid: string;
  type: MaterialType.URL_MATERIAL;
  name: string;
  description?: string;
  url: string;
  faviconUrl?: string;
};

export type Material = {
  material: UrlMaterial | FileMaterial;
};

export type FileMaterialCreateRequest = {
  type: MaterialType.FILE_MATERIAL;
  name: string;
  description?: string;
  file: File;
};

export type UrlMaterialCreateRequest = {
  type: MaterialType.URL_MATERIAL;
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
