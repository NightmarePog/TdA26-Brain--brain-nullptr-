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

      {posts.map((post) => (
        <Card key={post.id} className="transition hover:shadow-md">
          <CardHeader className="flex flex-row items-center justify-between">
            <div className="flex items-center gap-4">
              <Avatar className="h-11 w-11">
                <AvatarImage src="" />
                <AvatarFallback className="text-sm font-medium">
                  {post.author
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </AvatarFallback>
              </Avatar>
              <div className="flex flex-col">
                <span className="font-semibold leading-none">
                  {post.author}
                </span>
                <span className="text-sm text-muted-foreground">
                  {post.date}
                </span>
              </div>
            </div>
          </CardHeader>

          <CardContent className="text-base leading-relaxed">
            {post.content}
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default FeedPage;
