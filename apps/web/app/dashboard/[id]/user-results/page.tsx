"use client";

import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Spinner } from "@/components/ui/spinner";
import { CoursesApi } from "@/lib/api";
import PageTitle from "@/components/ui/typography/pageTitle";
import { useQuery } from "@tanstack/react-query";

export type Answer = {
  uuid: string;
  quizUuid: string;
  courseUuid?: string;
  userId?: number;
  score: number;
  maxScore: number;
  submittedAt: string;
};

// vibecoding level million :3
// i have no sanity at this point

const QuizAnswers = () => {
  const { data, isLoading, isError, error } = useQuery<Answer[]>({
    queryKey: ["allQuizAnswers"],
    queryFn: async () => {
      // 1️⃣ Získáme všechny kurzy
      const courses = await CoursesApi.getAll();

      // 2️⃣ Pro každý kurz získáme všechny kvízy a odpovědi
      const allAnswers = await Promise.all(
        courses.map(async (course: any) => {
          const quizzes = await CoursesApi.quizzes.getAll(course.uuid);

          // Extrahujeme odpovědi z každého kvízu
          const answers: Answer[] = quizzes.flatMap((quiz: any) =>
            (quiz.answers || []).map((a: any) => ({
              ...a,
              courseUuid: course.uuid,
              quizUuid: quiz.uuid, // musí být správně naplněno
            })),
          );

          return answers;
        }),
      );

      // 3️⃣ Spojíme všechny odpovědi do jednoho pole
      return allAnswers.flat();
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center py-10">
        <Spinner className="w-8 h-8" />
      </div>
    );

  if (isError)
    return (
      <p className="text-red-500 text-center py-10">
        Nepodařilo se načíst odpovědi: {(error as Error)?.message}
      </p>
    );

  if (!data || data.length === 0)
    return (
      <p className="text-center py-10 text-gray-500">
        Žádné odpovědi k zobrazení
      </p>
    );

  return (
    <div className="w-full h-full px-4 py-6">
      <PageTitle>Odpovědi ze všech kvízů</PageTitle>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-4">
        {data.map((answer: Answer) => (
          <Card
            key={answer.uuid}
            className="hover:shadow-xl transition-shadow rounded-2xl overflow-hidden flex flex-col"
          >
            <CardHeader className="bg-gray-100 px-4 py-3">
              <CardTitle className="text-sm font-medium text-gray-700">
                Uživatel:{" "}
                {answer.userId
                  ? answer.userId.toString().slice(0, 5)
                  : "neznámý"}
              </CardTitle>
            </CardHeader>

            <CardContent className="flex-1 p-4 flex flex-col justify-between">
              <div className="space-y-2">
                <p>
                  Skóre: <span className="font-semibold">{answer.score}</span> /{" "}
                  {answer.maxScore}
                </p>
                <p className="text-gray-500 text-sm">
                  Odesláno: {new Date(answer.submittedAt).toLocaleString()}
                </p>
              </div>

              {answer.courseUuid && (
                <p className="mt-4 text-xs text-gray-400">
                  Kurz: {answer.courseUuid}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default QuizAnswers;
