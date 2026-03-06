import * as z from "zod";

export const CourseCreateRequest = z.object({
    name: z.string(),
    description: z.string().optional(),
    theme: z.string().optional(),
    openedAt: z.string().optional(),
    closedAt: z.string().optional(),
});
export type CourseCreateRequest = z.infer<typeof CourseCreateRequest>;

export const CourseUpdateRequest = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    theme: z.string().optional(),
    imageUrl: z.string().optional(),
    openedAt: z.string().optional(),
    closedAt: z.string().optional(),
});
export type CourseUpdateRequest = z.infer<typeof CourseUpdateRequest>;

export const QuizStats = z.object({
    quizUuid: z.string(),
    quizTitle: z.string(),
    attemptsCount: z.number(),
    questionCount: z.number(),
    maxScore: z.number(),
    minScoreAchieved: z.number().optional(),
    maxScoreAchieved: z.number().optional(),
    avgScoreAchieved: z.number().optional()
});
export type QuizStats = z.infer<typeof QuizStats>;

export const MaterialStats = z.object({
    materialUuid: z.string(),
    materialName: z.string(),
    viewCount: z.number()
});
export type MaterialStats = z.infer<typeof MaterialStats>;

export const ModuleStats = z.object({
    moduleUuid: z.string(),
    moduleName: z.string(),
    quizzes: QuizStats.array().optional(),
    materials: MaterialStats.array().optional()
});
export type ModuleStats = z.infer<typeof ModuleStats>;

export const CourseStats = z.object({
    modules: ModuleStats.array().optional()
});
export type CourseStats = z.infer<typeof CourseStats>;
