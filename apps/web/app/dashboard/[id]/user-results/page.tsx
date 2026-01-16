"use client";

import { useEffect, useState } from "react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CoursesApi } from "@/lib/api";
import PageTitle from "@/components/ui/typography/pageTitle";

export type Answer = {
  uuid: string;
  quizUuid: string;
  userId?: number;
  score: number;
  maxScore: number;
  submittedAt: string;
};

interface QuizAnswersProps {
  quizUuid: string;
}

const QuizAnswers = ({ quizUuid }: QuizAnswersProps) => {
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchAnswers = async () => {
      setLoading(true);
      setError(null);
      try {
        const allQuizzes = await CoursesApi.quizzes.getAll(quizUuid);
        const quiz = allQuizzes.find((q) => q.uuid === quizUuid);
        setAnswers(quiz?.answers || []);
      } catch (err) {
        console.error(err);
        setError("Nepodařilo se načíst odpovědi");
      } finally {
        setLoading(false);
      }
    };

    fetchAnswers();
  }, [quizUuid]);

  if (loading)
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-8 h-8" />
      </div>
    );

  if (error) return <p className="text-red-500 text-center py-10">{error}</p>;

  if (answers.length === 0)
    return (
      <p className="text-center py-10 text-gray-500">
        Žádné odpovědi k zobrazení
      </p>
    );

  return (
    <div className="grid gap-4">
      <PageTitle>odpovědi</PageTitle>
      {answers.map((answer) => (
        <Card key={answer.uuid} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle>
              Odpověď uživatele {answer.userId ?? "neznámý"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-1">
            <p>
              Skóre: <span className="font-semibold">{answer.score}</span> /{" "}
              {answer.maxScore}
            </p>
            <p>
              Odesláno:{" "}
              <span className="text-gray-600">
                {new Date(answer.submittedAt).toLocaleString()}
              </span>
            </p>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default QuizAnswers;
