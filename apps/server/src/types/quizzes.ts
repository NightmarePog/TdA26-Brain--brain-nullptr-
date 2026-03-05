import * as z from "zod";

export const QuestionCreateRequest = z.object({
    type: z.string(),
    question: z.string(),
    options: z.string().array(),
    correctIndex: z.number().optional(),
    correctIndices: z.number().array().optional()
});
export type QuestionCreateRequest = z.infer<typeof QuestionCreateRequest>;

export const QuizCreateRequest = z.object({
    title: z.string(),
    description: z.string().optional(),
    questions: QuestionCreateRequest.array()
});
export type QuizCreateRequest = z.infer<typeof QuizCreateRequest>;

export const QuizUpdateRequest = z.object({
    title: z.string().optional(),
    description: z.string().optional(),
    questions: QuestionCreateRequest.array()
});
export type QuizUpdateRequest = z.infer<typeof QuizUpdateRequest>;

export const Answer = z.object({
    uuid: z.string(),
    selectedIndex: z.number().optional(),
    selectedIndices: z.number().array().optional()
});
export type Answer = z.infer<typeof Answer>;

export const QuizSubmitRequest = z.object({
    answers: Answer.array()
});
export type QuizSubmitRequest = z.infer<typeof QuizSubmitRequest>;
