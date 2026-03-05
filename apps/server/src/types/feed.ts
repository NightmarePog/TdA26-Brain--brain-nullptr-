import * as z from "zod";

export enum FeedMessages {
	CREATE = "has been created",
	EDIT = "has been edited",
	DELETE = "has been deleted",
};

export const FeedCreateRequest = z.object({
	message: z.string()
});
export type FeedCreateRequest = z.infer<typeof FeedCreateRequest>;