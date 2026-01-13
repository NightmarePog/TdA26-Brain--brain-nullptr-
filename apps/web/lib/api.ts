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
import { userLoginRecieve, userLoginSend } from "@/types/api/user";
import axios from "axios";
import { appConfig } from "@/const/config";

import materials from "@/const/material";
import { quizzes } from "@/const/quizzes";
import { feedItems } from "@/const/feed";
import { courses } from "@/const/courses";

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
   * MATERIALS
   */
  materials: {
    getAll: async (uuid: string) => {
      if (appConfig.frontendDebug) return materials;
      const res = await api.get(`/courses/${uuid}/materials`);
      return res.data as Material[];
    },
    get: async (courseId: string, materialId: string) => {
      if (appConfig.frontendDebug) return materials[1];
      const res = await api.get(`/courses/${courseId}/materials/${materialId}`);
      return res.data as Material;
    },
    post: async (
      uuid: string,
      data: UrlMaterialCreateRequest | FileMaterialCreateRequest,
    ) => {
      const res = await api.post(`/courses/${uuid}/materials`, data);
      return res.data as Material;
    },
    put: async (
      uuid: string,
      materialUuid: string,
      data: FileMaterialUpdateRequest | UrlMaterialUpdateRequest,
    ) => {
      const res = await api.put(
        `/courses/${uuid}/materials/${materialUuid}`,
        data,
      );
      return res.data as Material;
    },
    delete: async (uuid: string, materialUuid: string) => {
      const res = await api.put(`/courses/${uuid}/materials/${materialUuid}`);
      return res.data as string;
    },
  },
  /**
   * QUIZZES
   */
  quizzes: {
    getAll: async (uuid: string) => {
      if (appConfig.frontendDebug) return quizzes;
      const res = await api.get(`/courses/${uuid}/quizzes`);
      return res.data as Quiz[];
    },
    post: async (uuid: string, data: QuizCreateRequest) => {
      const res = await api.post(`/courses/${uuid}/quizzes`, data);
      return res.data as Quiz;
    },
    get: async (uuid: string, quizUuid: string) => {
      if (appConfig.frontendDebug) return quizzes[0];
      const res = await api.post(`/courses/${uuid}/quizzes/${quizUuid}`);
      return res.data as Quiz;
    },
    put: async (uuid: string, quizUuid: string, data: QuizUpdateRequest) => {
      const res = await api.put(`/courses/${uuid}/quizzes/${quizUuid}`, data);
      return res.data as Quiz;
    },
    delete: async (uuid: string, quizUuid: string) => {
      const res = await api.put(`/courses/${uuid}/quizzes/${quizUuid}`);
      return res.data as string;
    },

    postSubmit: async (
      uuid: string,
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

      // normální API call
      const res = await api.post(
        `/courses/${uuid}/quizzes/${quizUuid}/submit`,
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
      const res = await api.put(`/courses/${uuid}/feed/${feedUuid}`);
      return res.data as string;
    },
    getStream: async (uuid: string) => {
      const res = await api.post(`/courses/${uuid}/feed/stream`);
      return res.data as StreamResponse;
    },
  },
};

export const userApi = {
  post: async (data: userLoginSend) => {
    if (appConfig.frontendDebug) {
      return {
        message: "Login successful",
      } as userLoginRecieve;
    }

    const res = await api.post(`/users/login`, data);
    return res.data as userLoginRecieve;
  },
};
