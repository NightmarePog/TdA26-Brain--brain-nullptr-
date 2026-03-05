import * as z from "zod";

export const UrlCreateRequest = z.object({
    url: z.string(),
    name: z.string(),
    description: z.string().optional()
});
export type UrlCreateRequest = z.infer<typeof UrlCreateRequest>;

export const FileCreateRequest = z.object({
    name: z.string().optional(),
    description: z.string().optional()
});
export type FileCreateRequest = z.infer<typeof FileCreateRequest>;

export const UrlUpdateRequest = z.object({
    url: z.string().optional(),
    name: z.string().optional(),
    description: z.string().optional()
});
export type UrlUpdateRequest = z.infer<typeof UrlUpdateRequest>;

export const FileUpdateRequest = FileCreateRequest;
export type FileUpdateRequest = z.infer<typeof UrlUpdateRequest>;