"use client";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableRow } from "@/components/ui/table";

const QuizzesPage = () => {
  return (
    <Table className="border-y">
      <TableBody>
        <TableRow key="row-1" className="hover:bg-gray-600">
          <TableCell>TEST QUIZ</TableCell>
          <TableCell className="text-right">
            <Button>Začít</Button>
          </TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
};

export default QuizzesPage;
