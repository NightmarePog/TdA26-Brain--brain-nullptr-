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