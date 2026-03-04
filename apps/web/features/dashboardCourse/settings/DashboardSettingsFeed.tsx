import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Send, Trash2 } from "lucide-react";

const DashboardSettingsFeed = () => {
  return (
    <div className="flex flex-col h-full lg:border-l">
      <h1 className="text-2xl font-bold p-5">Informační kanál</h1>

      <div className="flex-1 overflow-y-auto ">
        <DashboardSettingsFeedMessage />
        <DashboardSettingsFeedMessage />
        <DashboardSettingsFeedMessage />
      </div>

      <DashboardSettingsFeedInput />
    </div>
  );
};

export default DashboardSettingsFeed;

export function DashboardSettingsFeedMessage() {
  return (
    <Card className="m-5 px-5 py-2 gap-0 shadow-2xl">
      <h2 className="text-xl font-bold">author</h2>
      <div className="flex justify-between">
        <p>message</p>
        <Button variant={"destructive"}>
          <Trash2 />
        </Button>
      </div>
    </Card>
  );
}

export function DashboardSettingsFeedInput() {
  return (
    <div className="flex flex-col items-end gap-2 mx-5 mb-5">
      <Textarea className="h-20 resize-none" placeholder="Pište zprávu" />
      <Button className="w-28 h-9">
        <Send /> Poslat
      </Button>
    </div>
  );
}
