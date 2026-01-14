"use client";

import Feed from "@/components/layouts/feed";
import { Button } from "@/components/ui/button";
import { MessageError } from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import PageTitle from "@/components/ui/typography/pageTitle";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { FeedCreateRequest } from "@/types/api/feed";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";

const FeedPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const [msg, setMsg] = useState<string>(""); // správně destructuring
  const [preview, setPreview] = useState<string>("");

  // Query feed
  const { isLoading, isError, error, data, refetch } = useQuery({
    queryKey: ["feed", addressingToUuid],
    queryFn: () => CoursesApi.feed.getAll(courseUuid),
  });

  if (isLoading) return <p>loading…</p>;
  if (isError || !data) {
    return <MessageError message={error?.message || "neznámá chyba"} />;
  }

  // Odeslat zprávu
  const sendMessage = async () => {
    if (!msg.trim()) return;
    const payload: FeedCreateRequest = { message: msg };

    try {
      await toast.promise(CoursesApi.feed.post(courseUuid, payload), {
        loading: "Odesílám…",
        success: () => "Zpráva odeslána!",
        error: (err) => `Chyba: ${err.message}`,
      });
      setMsg("");
      setPreview("");
      refetch(); // reload feed
    } catch {}
  };

  const deleteFeed = (feedUuid: string) => {
    try {
      toast.promise(CoursesApi.feed.delete(courseUuid, feedUuid), {
        loading: "Mažu…",
        success: () => "Smazáno!",
        error: (err) => `Chyba: ${err.message}`,
      });
      refetch();
    } catch {}
  };

  return (
    <div className="w-full">
      <PageTitle>Feed</PageTitle>
      <div className="p-6 space-y-6 w-full">
        {/* Form */}
        <form
          className="flex flex-col gap-2"
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage();
          }}
        >
          <div className="flex gap-2">
            <Input
              placeholder="Zpráva..."
              value={msg}
              onChange={(e) => {
                setMsg(e.target.value);
                setPreview(e.target.value); // live preview
              }}
            />
            <Button type="submit" className="w-24">
              Poslat
            </Button>
          </div>

          {/* Live preview */}
          {preview && (
            <div className="mt-1 p-2 text-gray-200 rounded shadow-sm transition-all duration-200 ease-in-out">
              <span className="text-sm italic">Preview: </span>
              {preview}
            </div>
          )}
        </form>

        {/* Feed items */}
        <div className="space-y-4">
          {data.map((item) => (
            <Feed
              key={item.uuid}
              author={item.type}
              message={item.message}
              editable
              onDelete={() => deleteFeed(item.uuid)}
            />
          ))}
        </div>
      </div>
    </div>
  );
};

export default FeedPage;
