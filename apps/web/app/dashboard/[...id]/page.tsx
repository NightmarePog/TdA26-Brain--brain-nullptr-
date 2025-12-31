"use client";

import { Button } from "@/components/ui/button";
import { FileInputComp } from "@/components/ui/fileInput";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";
import { Textarea } from "@/components/ui/textarea";
import { ArrowLeft, Upload } from "lucide-react";

const DashboardPage = () => {
  return (
    <div className="relative top-10 ml-10 flex gap-10 right-5">
      <Button className="mb-10">
        <ArrowLeft />
        Zpátky
      </Button>
      {/* left */}
      <div className="flex-1 flex flex-col gap-4">
        <div>
          <Label>Jméno Kurzu</Label>
          <Input className="w-full" />
        </div>

        <div>
          <Label>Popisek</Label>
          <Textarea className="w-full" />
        </div>

        <div>
          <Label>Soubory</Label>
          <FileInputComp />
          <Button className="my-5 flex items-center gap-2">
            Nahrát
            <Upload />
          </Button>
        </div>

        <Table className="border-y">
          <TableBody>
            <TableRow key="row-1" className="hover:bg-gray-600">
              <TableCell>TEST NAME</TableCell>
              <TableCell className="text-right flex justify-end gap-2">
                <Button>Upravit</Button>
                <Button variant="destructive">Smazat</Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </div>

      {/* right */}
      <div className="flex-1 flex-col gap-10">
        {/* quizzes */}
        <div className="mb-10">
          <h1>kvízy</h1>
          <Table className="border-y">
            <TableBody>
              <TableRow key="row-1" className="hover:bg-gray-600">
                <TableCell>TEST NAME</TableCell>
                <TableCell className="text-right flex justify-end gap-2">
                  <Button>Upravit</Button>
                  <Button variant="destructive">Smazat</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
        {/* Feed */}
        <div className="mb-5">
          <h1>feed</h1>
          <div className="flex flex-col gap-2 mb-10">
            <Input />
            <div className="flex justify-end">
              <Button>Poslat</Button>
            </div>
          </div>

          <Table className="border-y">
            <TableBody>
              <TableRow key="row-1" className="hover:bg-gray-600">
                <TableCell>TEST TEXT</TableCell>
                <TableCell className="text-right">
                  <Button variant={"destructive"}>smazat</Button>
                </TableCell>
              </TableRow>
              <TableRow key="row-2" className="hover:bg-gray-600">
                <TableCell>TEST2 TEXT</TableCell>
                <TableCell className="text-right">
                  <Button variant={"destructive"}>smazat</Button>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
