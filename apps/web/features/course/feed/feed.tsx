"use client";

import { MessageError } from "@/components/ui/errorComponents";
import PageTitle from "@/components/ui/typography/pageTitle";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import FeedMessage from "./feedMessage";
import useSafeQuery from "@/features/query/useSafeQuery";
import { FeedItem } from "@/types/api/feed";

const Feed = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();

  const { data, queryStatus, StatusElement } = useSafeQuery<FeedItem[]>({
    queryKey: ["feed", addressingToUuid],
    queryFn: () => CoursesApi.feed.getAll(courseUuid),
    enabled: true,
  });

  return (
    <div className="w-full">
      <PageTitle>Feed</PageTitle>
      <div className="p-6  space-y-6 w-full">
        <div className="space-y-4">
          {queryStatus === "finished"
            ? data!.map((item) => (
                <FeedMessage
                  key={item.uuid}
                  author={item.type}
                  message={item.message}
                />
              ))
            : StatusElement}
        </div>
      </div>
    </div>
  );
};

export default Feed;
