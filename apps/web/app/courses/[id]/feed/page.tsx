"use client";

import Feed from "@/components/layouts/feed";
import { feedItems } from "@/const/feed";

const FeedPage = () => {
  return (
    <div className="p-6  space-y-6 w-full">
      <h1 className="text-4xl font-bold ">Feed</h1>

      <div className="space-y-4">
        {feedItems.map((item) => (
          <Feed key={item.uuid} author={item.type} message={item.message} />
        ))}
      </div>
    </div>
  );
};

export default FeedPage;
