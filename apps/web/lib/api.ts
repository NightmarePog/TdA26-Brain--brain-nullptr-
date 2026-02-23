import {
  CourseCreateRequest,
  CourseDetails,
  Course,
  CourseUpdateRequest,
} from "@/types/api/courses";
import {
  FileMaterialCreateRequest,
  FileMaterialUpdateRequest,
  Material,
  UrlMaterialCreateRequest,
  UrlMaterialUpdateRequest,
} from "@/types/api/materials";
import {
  QuestionCreateRequest,
  QuestionUpdateRequest,
  Quiz,
  QuizCreateRequest,
  QuizSubmitRequest,
  QuizSubmitResponse,
  QuizUpdateRequest,
} from "@/types/api/quizzes";
import {
  FeedCreateRequest,
  FeedItem,
  FeedUpdateRequest,
  StreamResponse,
} from "@/types/api/feed";
import { User, UserLoginReceive, UserLoginSend } from "@/types/api/users";
import axios from "axios";
import { appConfig } from "@/const/config";

import materials from "@/const/material";
import { quizzes } from "@/const/quizzes";
import { feedItems } from "@/const/feed";
import { courses } from "@/const/courses";
import { modules } from "@/const/modules";
import { Module, ModuleCreateRequest, ModuleDetails, ModuleUpdateRequest } from "@/types/api/modules";

export const api = axios.create({
  baseURL: "/api",
});

export const rootAPI = async () => {
  const res = await api.get("/");
  return res.data;
};

export const CoursesApi = {
  /**
   * COURSES
   */
  getAll: async () => {
    if (appConfig.frontendDebug) return courses;
    const res = await api.get(`/courses`);
    return res.data as Course[];
  },
  post: async (data: CourseCreateRequest) => {
    if (appConfig.frontendDebug) return courses[0];
    const res = await api.post(`/courses`, data);
    return res.data as Course;
  },
  get: async (uuid: string) => {
    if (appConfig.frontendDebug) return courses[1];
    const res = await api.get(`/courses/${uuid}`);
    return res.data as CourseDetails;
  },
  put: async (uuid: string, data: CourseUpdateRequest) => {
    const res = await api.put(`/courses/${uuid}`, data);
    return res.data as Course;
  },
  delete: async (uuid: string) => {
    const res = await api.delete(`/courses/${uuid}`);
    return res.data as string;
  },
  /**
   * MODULES
   */
  modules: {
    getAll: async (uuid: string) => {
      if (appConfig.frontendDebug) return modules;
      const res = await api.get(`/courses/${uuid}/modules`);
      return res.data as Module[];
    },
    post: async (uuid: string, data: ModuleCreateRequest) => {
      if (appConfig.frontendDebug) return modules[1];
      const res = await api.post(`/courses/${uuid}/modules`, data);
      return res.data as Module;
    },
    get: async (uuid: string, moduleUuid: string) => {
      if (appConfig.frontendDebug) return modules[1];
      const res = await api.get(`/courses/${uuid}/modules/${moduleUuid}`);
      return res.data as ModuleDetails;
    },
    put: async (uuid: string, moduleUuid : string, data: ModuleUpdateRequest) => {
      const res = await api.put(`/courses/${uuid}/modules/${moduleUuid}`, data);
      return res.data as Module;
    },
    delete: async (uuid: string, moduleUuid: string) => {
      const res = await api.delete(`/courses/${uuid}/modules/${moduleUuid}`);
      return res.data as string;
    }
  },
  /**
   * MATERIALS
   */
  materials: {
    getAll: async (uuid: string, moduleUuid: string) => {
      if (appConfig.frontendDebug) return materials;
      const res = await api.get(`/courses/${uuid}/modules/${moduleUuid}/materials`);
      return res.data as Material[];
    },
    get: async (uuid: string, moduleUuid: string, materialUuid: string) => {
      if (appConfig.frontendDebug) return materials[1];
      const res = await api.get(`/courses/${uuid}/modules/${moduleUuid}/materials/${materialUuid}`);
      return res.data as Material;
    },
    post: async (
      uuid: string,
      moduleUuid: string,
      data: UrlMaterialCreateRequest | FileMaterialCreateRequest,
    ) => {
      const res = await api.post(`/courses/${uuid}/modules/${moduleUuid}/materials`, data);
      return res.data as Material;
    },
    put: async (
      uuid: string,
      moduleUuid: string,
      materialUuid: string,
      data: FileMaterialUpdateRequest | UrlMaterialUpdateRequest,
    ) => {
      const res = await api.put(
        `/courses/${uuid}/modules/${moduleUuid}/materials/${materialUuid}`,
        data,
      );
      return res.data as Material;
    },
    delete: async (uuid: string, moduleUuid: string, materialUuid: string) => {
      const res = await api.put(`/courses/${uuid}/modules/${moduleUuid}/materials/${materialUuid}`);
      return res.data as string;
    },
  },
  /**
   * QUIZZES
   */
  quizzes: {
    getAll: async (uuid: string, moduleUuid: string) => {
      if (appConfig.frontendDebug) return quizzes;
      const res = await api.get(`/courses/${uuid}/modules/${moduleUuid}/quizzes`);
      return res.data as Quiz[];
    },
    post: async (uuid: string, moduleUuid: string, data: QuizCreateRequest) => {
      const res = await api.post(`/courses/${uuid}/modules/${moduleUuid}/quizzes`, data);
      return res.data as Quiz;
    },
    get: async (uuid: string, moduleUuid: string, quizUuid: string) => {
      if (appConfig.frontendDebug) return quizzes[0];
<<<<<<< HEAD
      const res = await api.get(`/courses/${uuid}/quizzes/${quizUuid}`);
=======
      const res = await api.post(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}`);
>>>>>>> courses
      return res.data as Quiz;
    },
    put: async (uuid: string, moduleUuid: string, quizUuid: string, data: QuizUpdateRequest) => {
      const res = await api.put(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}`, data);
      return res.data as Quiz;
    },
    delete: async (uuid: string, moduleUuid: string, quizUuid: string) => {
      const res = await api.put(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}`);
      return res.data as string;
    },

    questionsPost: async (uuid: string, moduleUuid: string, quizUuid: string, data: QuestionCreateRequest) => {
      const res = await api.post(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}/questions`, data);
      return res.data as Quiz;
    },
    questionsPut: async (uuid: string, moduleUuid: string, quizUuid: string, questionUuid: string, data: QuestionUpdateRequest) => {
      const res = await api.put(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}/questions/${questionUuid}`, data);
      return res.data as Quiz;
    },
    questionsDelete: async (uuid: string, moduleUuid: string, quizUuid: string, questionUuid: string) => {
      const res = await api.delete(`/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}/questions/${questionUuid}`);
      return res.data as string;
    },

    postSubmit: async (
      uuid: string,
      moduleUuid: string,
      quizUuid: string,
      data: QuizSubmitRequest,
    ) => {
      if (appConfig.frontendDebug) {
        const maxScore = data.answers.length;
        const score = Math.floor(Math.random() * (maxScore + 1));

        const correctPerQuestion = data.answers.map(() => Math.random() > 0.5);

        const randomData: QuizSubmitResponse = {
          quizUuid,
          score,
          maxScore,
          submittedAt: new Date().toISOString(),
          correctPerQuestion,
        };
        return randomData;
      }

      const res = await api.post(
        `/courses/${uuid}/modules/${moduleUuid}/quizzes/${quizUuid}/submit`,
        data,
      );
      return res.data as QuizSubmitResponse;
    },
  },
  /**
   * FEED
   */
  feed: {
    getAll: async (uuid: string) => {
      if (appConfig.frontendDebug) return feedItems;
      const res = await api.get(`/courses/${uuid}/feed`);
      return res.data as FeedItem[];
    },
    post: async (uuid: string, data: FeedCreateRequest) => {
      const res = await api.post(`/courses/${uuid}/feed`, data);
      return res.data as FeedItem;
    },
    put: async (uuid: string, feedUuid: string, data: FeedUpdateRequest) => {
      const res = await api.put(`/courses/${uuid}/feed/${feedUuid}`, data);
      return res.data as FeedItem;
    },
    delete: async (uuid: string, feedUuid: string) => {
      const res = await api.delete(`/courses/${uuid}/feed/${feedUuid}`);
      return res.data as string;
    },
    getStream: async (uuid: string) => {
      const res = await api.post(`/courses/${uuid}/feed/stream`);
      return res.data as StreamResponse;
    },
  },
};

export const userApi = {
  get: async () => {
    if (appConfig.frontendDebug) {
      return {
        name: "lecturer",
      };
    }

    const res = await api.get(`/users/auth`);
    return res.data as User;
  },
  post: async (data: UserLoginSend) => {
    if (appConfig.frontendDebug) {
      return {
        message: "Login successful",
      } as UserLoginReceive;
    }

    const res = await api.post(`/users/login`, data);
    return res.data as UserLoginReceive;
  },

  check: async () => {
    if (appConfig.frontendDebug) {
      return true;
    }

    const res = await api.post(`/users/login/auth`);
    return res.data;
  },
};
