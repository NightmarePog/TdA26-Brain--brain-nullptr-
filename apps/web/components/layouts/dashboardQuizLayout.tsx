import { useQuery } from "@tanstack/react-query";
import { Button } from "../ui/button";
import { Input } from "../ui/input";
import { Label } from "../ui/label";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../ui/table";
import PageTitle from "../ui/typography/pageTitle";
import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import { Plus } from "phosphor-react";
import { useRouter } from "next/navigation";
import { Quiz } from "@/types/api/quizzes";

interface DashboardQuizLayoutProps {
  data: Quiz;
}

const DashboardQuizLayout = ({ data }: DashboardQuizLayoutProps) => {
  const router = useRouter();
  const goToQuestion = (questionUuid: string) => {
    router.push(`?question=${questionUuid}`);
  };
  return (
    <div className="w-full">
      <PageTitle>Editace Kvízu</PageTitle>
      <div className="m-10">
        <Label className="mb-2">Název kvízu</Label>
        <div className="flex">
          <Input defaultValue={data!.title} />
          <Button>Potvrdit</Button>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Název</TableHead>
              <TableHead>Stav</TableHead>
              <TableHead className="text-right">Akce</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data!.questions.map((item, key) => (
              <TableRow key={key}>
                <TableCell>{item.question}</TableCell>
                <TableCell>
                  {item.type === "multipleChoice" && "Vícero odpovědí"}
                  {item.type === "singleChoice" && "jedna odpověď"}
                </TableCell>
                <TableCell className="text-right ">
                  <Button
                    className="mr-2"
                    onClick={() => goToQuestion(item.uuid)}
                  >
                    Upravit
                  </Button>
                  <Button variant={"destructive"}>Smazat</Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
        <div className="flex justify-end m-3">
          <Button>
            <Plus />
            přidat otázku
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuizLayout;
