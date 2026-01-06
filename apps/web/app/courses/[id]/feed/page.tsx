"use client";

import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import AppCard, { AppCardType } from "@/components/ui/appCard";

const posts = [
  {
    id: 1,
    author: "Jan Novák",
    content: "A feed test",
    date: "5. 1. 2026",
  },
  {
    id: 2,
    author: "Petra Svobodová",
    content: "Shadcn is peak :3 :3 :3",
    date: "4. 1. 2026",
  },
];

const FeedPage = () => {
  return (
    <div className="mx-auto max-w-3xl space-y-6 p-6">
      <h1 className="text-3xl font-bold">Feed</h1>

      <AppCard
        appCards={posts.map((item) => {
          const remap: AppCardType = {
            title: item.content,
            description: item.author,
            key: item.id,
            previewImg: "/tda.png",
            onClick: () => null,
          };
          return remap;
        })}
      />
    </div>
  );
};

export default FeedPage;
