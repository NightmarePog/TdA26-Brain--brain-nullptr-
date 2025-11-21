enum MaterialType {
  FILE_MATERIAL,
  URL_MATERIAL,
}

interface FileMaterial {
  uuid: string;
  type: MaterialType.FILE_MATERIAL;
  name: string;
  description?: string;
  fileUrl: string;
  mimeType: string;
  sizeBytes: number;
}

interface UrlMaterial {
  uuid: string;
  type: MaterialType.URL_MATERIAL;
  name: string;
  description?: string;
  url: string;
  faviconUrl?: string;
}

export interface Material {
  material: UrlMaterial | FileMaterial;
}

export interface FileMaterialCreateRequest {
  type: MaterialType.FILE_MATERIAL;
  name: string;
  description?: string;
  file: File;
}

export interface UrlMaterialCreateRequest {
  type: MaterialType.URL_MATERIAL;
  name: string;
  description?: string;
  url: string;
}

export interface FileMaterialUpdateRequest {
  name?: string;
  description?: string;
  file?: File;
}

export interface UrlMaterialUpdateRequest {
  name?: string;
  description?: string;
  url?: string;
}
