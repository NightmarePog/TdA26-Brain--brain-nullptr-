"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Wrench } from "lucide-react";

const DashboardCourseSettingsWindow = () => {
  const [title, setTitle] = useState("Název kurzu");
  const [description, setDescription] = useState("Popisek kurzu");

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button className="bg-[#FF7F0E] hover:bg-[#FF7F0E]/50">
          <Wrench />
          editovat kurz
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Nastavení kurzu</DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Název</Label>
            <Input
              id="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Popisek</Label>
            <Textarea
              id="description"
              className="resize-none"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button>Uložit změny</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default DashboardCourseSettingsWindow;
