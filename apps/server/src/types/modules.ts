import * as z from "zod";

export const ModuleCreateRequest = z.object({
    name: z.string(),
    description: z.string().optional()
});
export type ModuleCreateRequest = z.infer<typeof ModuleCreateRequest>;

export const ModuleUpdateRequest = z.object({
    name: z.string().optional(),
    description: z.string().optional(),
    state: z.string().optional()
});
export type ModuleUpdateRequest = z.infer<typeof ModuleUpdateRequest>;