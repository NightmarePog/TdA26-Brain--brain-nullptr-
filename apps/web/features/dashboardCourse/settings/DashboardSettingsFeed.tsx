import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { FeedCreateRequest } from "@/types/api/feed";
import { useQuery } from "@tanstack/react-query";
import { AxiosError } from "axios";
import { Send, Trash2 } from "lucide-react";
import { useState } from "react";

interface DashboardSettingsFeedMessage {
  message: string;
  author: string;
  messageUuid: string;
  courseUuid: string;
  type: "manual" | "system";
}

const DashboardSettingsFeed = () => {
  const routeData = useCourseAddress();
  const { data, isLoading, isError, error } = useQuery({
    queryKey: ["Feed"],
    queryFn: () => CoursesApi.feed.getAll(routeData.courseUuid),
  });
  if (isLoading || isError || !data) return;
  return (
    <div className="flex flex-col h-full lg:border-l">
      <h1 className="text-2xl font-bold p-5">Informační kanál</h1>

      <div className="flex-1 overflow-y-auto ">
        {data.map((item) => (
          <DashboardSettingsFeedMessage
            message={item.message}
            author={item.type === "manual" ? "Lector" : "System"}
            key={item.uuid}
            messageUuid={item.uuid}
            courseUuid={routeData.courseUuid}
            type={item.type}
          />
        ))}
      </div>

      <DashboardSettingsFeedInput courseUuid={routeData.courseUuid} />
    </div>
  );
};

export default DashboardSettingsFeed;

export function DashboardSettingsFeedMessage({
  message,
  author,
  messageUuid,
  courseUuid,
  type,
}: DashboardSettingsFeedMessage) {
  return (
    <Card className="m-5 px-5 py-2 gap-0 shadow-2xl">
      <h2 className="text-xl font-bold">{author}</h2>
      <div className="flex justify-between">
        <p>{message}</p>
        {type === "manual" && (
          <DeleteMessageButton
            MessageUuid={messageUuid}
            courseUuid={courseUuid}
          />
        )}
      </div>
    </Card>
  );
}

interface DashboardSettingsFeedInputProps {
  courseUuid: string;
}

export function DashboardSettingsFeedInput({
  courseUuid,
}: DashboardSettingsFeedInputProps) {
  const [message, setMessage] = useState("");

  const submitMessage = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      await CoursesApi.feed.post(courseUuid, { message });

      toast.success("Zpráva byla poslána");
    } catch (err: unknown) {
      const error = err as AxiosError;
      toast.error(`chyba: ${error.message}` || "Nepodařilo se poslat zprávu");
    }
  };

  return (
    <form
      onSubmit={(e) => submitMessage(e)}
      className="flex flex-col items-end gap-2 mx-5 mb-5"
    >
      <Textarea
        className="h-20 resize-none"
        placeholder="Pište zprávu"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <Button type="submit" className="w-28 h-9">
        <Send /> Poslat
      </Button>
    </form>
  );
}
interface DeleteMessageButtonProps {
  courseUuid: string;
  MessageUuid: string;
}
import { toast } from "sonner";

const DeleteMessageButton = ({
  courseUuid,
  MessageUuid,
}: DeleteMessageButtonProps) => {
  const handleDelete = async (e: React.SubmitEvent) => {
    e.preventDefault();

    try {
      await CoursesApi.feed.delete(courseUuid, MessageUuid);

      toast.success("Zpráva byla smazána");
    } catch (err: unknown) {
      const error = err as AxiosError;
      toast.error(`chyba: ${error.message}` || "Nepodařilo se smazat zprávu");
    }
  };

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button variant={"destructive"}>
          <Trash2 />
        </Button>
      </DialogTrigger>

      <DialogContent>
        <form onSubmit={(e) => handleDelete(e)}>
          <DialogTitle>Smazání zprávy</DialogTitle>

          <DialogDescription>
            Opravdu si přejete smazat tuto zprávu?
          </DialogDescription>

          <DialogFooter>
            <DialogClose asChild>
              <Button>Zrušit</Button>
            </DialogClose>
            <DialogClose asChild>
              <Button type="submit" variant={"destructive"}>
                Smazat
              </Button>
            </DialogClose>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};
