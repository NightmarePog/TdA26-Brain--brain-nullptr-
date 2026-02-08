import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Plus } from "phosphor-react";

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

import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import {
  Quiz,
  QuizUpdateRequest,
  SingleChoiceQuestionCreateRequest,
  Question,
  MultipleChoiceQuestionCreateRequest,
} from "@/types/api/quizzes";
import PageTitle from "../typography/pageTitle";

// --- HELPERS ---

/** Převod frontendové otázky na backendový typ */
function mapQuestionToUpdateRequest(
  q: Question,
): SingleChoiceQuestionCreateRequest | MultipleChoiceQuestionCreateRequest {
  if (q.type === "singleChoice") {
    return {
      type: "singleChoice",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex ?? 0,
    };
  } else {
    return {
      type: "multipleChoice",
      question: q.question,
      options: q.options,
      correctIndices: q.correctIndices ?? [],
    };
  }
}

/** Vytvoří payload pro update s novou primitivní single-choice otázkou */
function buildCourseUpdateWithNewQuestion(
  original: Quiz,
  newQuestionText: string = "Nová otázka",
): QuizUpdateRequest {
  const newQuestion: SingleChoiceQuestionCreateRequest = {
    type: "singleChoice",
    question: newQuestionText,
    options: ["Odpověď 1", "Odpověď 2"],
    correctIndex: 0,
  };

  const updatedQuestions = [
    ...original.questions.map(mapQuestionToUpdateRequest),
    newQuestion,
  ];

  return {
    title: original.title,
    questions: updatedQuestions,
  };
}

/** Vytvoří payload pro smazání otázky */
function buildCourseDelete(
  original: Quiz,
  questionUuid: string,
): QuizUpdateRequest {
  const filteredQuestions = original.questions
    .filter((q) => q.uuid !== questionUuid)
    .map(mapQuestionToUpdateRequest);

  return {
    title: original.title,
    questions: filteredQuestions,
  };
}

// --- COMPONENT ---

interface DashboardQuizLayoutProps {
  data: Quiz;
}

const DashboardQuizLayout = ({ data }: DashboardQuizLayoutProps) => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const router = useRouter();

  const goToQuestion = (questionUuid: string) => {
    router.push(`?question=${questionUuid}`);
  };

  const deleteQuestion = (questionUuid: string) => {
    if (!data) return;

    const editData = buildCourseDelete(data, questionUuid);

    toast.promise(
      CoursesApi.quizzes.put(courseUuid, addressingToUuid!, editData),
      {
        loading: "Mažu otázku…",
        success: "Otázka byla úspěšně smazána",
        error: (err) =>
          err?.response?.data?.message ?? "Nepodařilo se smazat otázku",
      },
    );
  };

  const createQuestion = (quiz: Quiz) => {
    if (!quiz) return;

    const payload = buildCourseUpdateWithNewQuestion(quiz);

    toast.promise(
      CoursesApi.quizzes.put(courseUuid, addressingToUuid!, payload),
      {
        loading: "Vytvářím otázku…",
        success: "Otázka byla úspěšně vytvořena",
        error: (err) =>
          err?.response?.data?.message ?? "Nepodařilo se vytvořit otázku",
      },
    );
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
              <TableRow key={item.uuid}>
                <TableCell>{item.question}</TableCell>
                <TableCell>
                  {item.type === "multipleChoice" && "Vícero odpovědí"}
                  {item.type === "singleChoice" && "Jedna odpověď"}
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    className="mr-2"
                    onClick={() => goToQuestion(item.uuid)}
                  >
                    Upravit
                  </Button>
                  <Button
                    variant={"destructive"}
                    onClick={() => deleteQuestion(item.uuid)}
                  >
                    Smazat
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        <div className="flex justify-end m-3">
          <Button onClick={() => createQuestion(data)}>
            <Plus />
            Přidat otázku
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuizLayout;
