"use client";

import { Button } from "@/components/ui/button";
import { FileInputComp } from "@/components/ui/fileInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";

const DashboardPage = () => {
  return (
    <>
      <div className="relative top-10 left-10">
        <Button>
          <ArrowLeft />
          Zpátky
        </Button>
        <div className="flex flex-col m-10 ml-20 gap-2">
          <div>
            <Label>Jméno Kurzu</Label>
            <Input className="max-w-100" />
          </div>
          <div>
            <Label>popisek</Label>
            <Textarea className="max-w-5/12" />
          </div>
          <div>
            <Label>soubory</Label>
            <FileInputComp />
            <Button>
              Nahrát
              <Upload />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
};

export default DashboardPage;
