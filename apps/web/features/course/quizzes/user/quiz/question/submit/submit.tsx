// this is whole vibecoded because i am lazy...
import { useState } from "react";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import submitQuiz from "../hooks/submitQuiz";
import { Question } from "@/types/api/quizzes";
import useCourseAddress from "@/hooks/useCourseAddress";
import { QuestionUserAnswerType } from "../quizLayout";
import { useRouter } from "next/navigation";

interface SubmitQuizLayoutProps {
  questions: Question[];
  answers: QuestionUserAnswerType[];
}

const SubmitQuizLayout = ({ questions, answers }: SubmitQuizLayoutProps) => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<null | {
    score: number;
    maxScore: number;
    correctPerQuestion: boolean[];
    submittedAt: string;
  }>(null);

  const handleSubmit = async () => {
    setLoading(true);
    try {
      const res = await submitQuiz({
        questionAnswers: answers,
        questions,
        courseUuid: courseUuid,
        quizUuid: addressingToUuid!,
      });

      setResult(res); // uložíme skóre
    } catch (err) {
      console.error("Chyba při submitu kvízu:", err);
    } finally {
      setLoading(false);
    }
  };

  // Pokud máme výsledek, zobrazíme obrazovku se skóre
  if (result) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-center text-xl">
              Výsledek kvízu
            </CardTitle>
          </CardHeader>

          <CardContent className="text-center">
            <p>
              Skóre: {result.score} / {result.maxScore}
            </p>
            <p>Odesláno: {new Date(result.submittedAt).toLocaleString()}</p>
            <p>
              Správně zodpovězené otázky:{" "}
              {result.correctPerQuestion.filter(Boolean).length} /{" "}
              {result.correctPerQuestion.length}
            </p>
          </CardContent>

          <CardFooter className="flex justify-center">
            <Button variant="default" onClick={() => router.back()}>
              Zpět kvízy
            </Button>
          </CardFooter>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">Odeslat kvíz</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-center text-foreground">
            Jste si jistí, že chcete svůj kvíz odeslat? Po odeslání už nebude
            možné upravovat odpovědi.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center gap-2">
          <Button variant="default" onClick={handleSubmit} disabled={loading}>
            {loading ? "Odesílám..." : "Odeslat kvíz"}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubmitQuizLayout;
