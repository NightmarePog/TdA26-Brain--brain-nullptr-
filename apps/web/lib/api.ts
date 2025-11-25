import {
  CourseCreateRequest,
  CourseDetails,
  CourseUpdateRequest,
} from "@/types/api/courses";
import {
  FileMaterialCreateRequest,
  FileMaterialUpdateRequest,
  Material,
  UrlMaterialCreateRequest,
  UrlMaterialUpdateRequest,
} from "@/types/api/materials";
import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export const rootAPI = async () => {
  const res = await api.get("/");
  return res.data;
};

export const CoursesApi = {
  /**
   * /api/courses/get/{id}
   * @param id
   * @returns
   */
  getAll: async () => {
    const res = await api.get(`/courses`);
    return res.data as CourseDetails[];
  },
  /**
   * /api/courses/get/{id}
   * @param id
   * @returns
   */
  post: async (data: CourseCreateRequest) => {
    const res = await api.post(`/courses`, data);
    return res.data as CourseDetails;
  },
  get: async (uuid: string) => {
    const res = await api.get(`/courses/${uuid}`);
    return res.data as CourseDetails;
  },
  put: async (uuid: string, data: CourseUpdateRequest) => {
    const res = await api.put(`/courses/${uuid}`, data);
    return res.data as CourseUpdateRequest;
  },

  delete: async (uuid: string) => {
    const res = await api.delete(`/courses/${uuid}`);
    return (res.data as string) || res.status;
  },

  materials: {
    getAll: async (courseId: string) => {
      const res = await api.get(`/courses/${courseId}/materials`);
      return res.data as Material[];
    },
    post: async (
      courseId: string,
      data: UrlMaterialCreateRequest | FileMaterialCreateRequest,
    ) => {
      const res = await api.post(`/courses/${courseId}/materials`, data);
      return res.data as Material;
    },
    put: async (
      courseId: string,
      materialId: number,
      data: FileMaterialUpdateRequest | UrlMaterialUpdateRequest,
    ) => {
      const res = await api.put(
        `/courses/${courseId}/materials/${materialId}`,
        data,
      );
      return res.data as Material;
    },
    delete: async (courseId: number, materialId: number) => {
      const res = await api.put(`/courses/${courseId}/materials/${materialId}`);
      return res.status;
    },
  },
};
