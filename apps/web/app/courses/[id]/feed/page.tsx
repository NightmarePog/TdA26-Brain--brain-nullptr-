"use client";

import Feed from "@/components/layouts/feed";
import { MessageError } from "@/components/ui/errorComponents";
import PageTitle from "@/components/ui/typography/pageTitle";
import { feedItems } from "@/const/feed";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";

const FeedPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["feed", addressingToUuid],
    queryFn: () => CoursesApi.feed.getAll(courseUuid),
  });
  if (isLoading) return <p>loading</p>;
  if (isError || !data) {
    return <MessageError message={error?.message || "neznámá chyba"} />;
  }
  return (
    <div className="w-full">
      <PageTitle>Feed</PageTitle>
      <div className="p-6  space-y-6 w-full">
        <div className="space-y-4">
          {data.map((item) => (
            <Feed key={item.uuid} author={item.type} message={item.message} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
