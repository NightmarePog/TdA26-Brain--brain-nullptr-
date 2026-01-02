export type FeedItem = {
    uuid: string;
    type: "manual" | "system";
    message: string;
    edited: boolean;
    createdAt: string;
    updatedAt: string;
};

export type FeedCreateRequest = {
    message: string;
};

export type FeedUpdateRequest = {
    message: string;
};

export type StreamResponse = {
    event: "new_post";
    data: FeedItem;
};