"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const MaterialsPage = () => {
  return (
    <Table className="border-y">
      <TableBody>
        <TableRow key="row-1" className="hover:bg-gray-600">
          <TableCell>TEST TEXT</TableCell>
          <TableCell className="text-right">
            <Button>Stáhnout</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default MaterialsPage;
