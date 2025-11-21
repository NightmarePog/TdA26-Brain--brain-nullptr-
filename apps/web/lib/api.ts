import axios from "axios";

export const api = axios.create({
  baseURL: "/api",
});

export const rootAPI = async () => {
  const res = await api.get("/");
  return res.data;
};

const CoursesApi = {
  get: async (id: number) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  post: async (id: number) => {
    const res = await api.get(`/courses/${id}`);
    return res.data;
  },
  put: async (id: number) => {
    const res = await api.put(`/courses/${id}`);
    return res.data;
  },
  delete: async (id: number) => {
    const res = await api.delete(`/courses/${id}`);
    return res.data;
  },

  materials: {
    get: async (id: number) => {
      const res = await api.get(`/courses/${id}/materials`);
      return res.data;
    },
    post: async (id: number) => {
      const res = await api.get(`/courses/${id}/materials`);
      return res.data;
      //TODO data
    },
    get: async (id: number) => {
      const res = await api.get(`/courses/${id}/materials`);
      return res.data;
    },
  },
};
