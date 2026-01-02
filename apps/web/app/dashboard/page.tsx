"use client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { CoursesConstLastViewed } from "@/const/courses";
import { useState } from "react";

const DashboardPage = () => {
  const [query, setQuery] = useState("");
  const data = CoursesConstLastViewed;
  return (
    <>
      <div className="flex justify-center p-5">
        <Input
          placeholder="Vyhledávat..."
          className="w-100"
          type="search"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <Table>
        <TableCaption>Dashboard</TableCaption>

        <TableHeader>
          <TableRow>
            <TableHead className="w-25">název</TableHead>
            <TableHead className="text-right">úprava / smazání</TableHead>
          </TableRow>
        </TableHeader>

        <TableBody>
          {data.map((item) => (
            <TableRow key="row-1" className="hover:bg-gray-600">
              <TableCell>{item.name}</TableCell>

              <TableCell className="text-right flex justify-end gap-2 ">
                <Button>Upravit</Button>
                <Button variant="destructive">Smazat</Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>

        <TableFooter></TableFooter>
      </Table>
    </>
  );
};

export default DashboardPage;
