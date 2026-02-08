"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";

import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";

import { usePathname, useRouter } from "next/navigation";
import useSafeQuery from "@/features/query/useSafeQuery";
import { Quiz } from "@/types/api/quizzes";

const SearchQuiz = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { courseUuid, addressingToUuid } = useCourseAddress();

  const { StatusElement, queryStatus, data } = useSafeQuery<Quiz[]>({
    queryKey: ["allQuizzes", addressingToUuid],
    queryFn: () => CoursesApi.quizzes.getAll(courseUuid),
    enabled: true,
  });

  const handleStartQuiz = (quizUuid: string) => {
    router.push(`${pathname}/${quizUuid}`);
  };

  if (queryStatus !== "finished" || !data) return StatusElement;
  return (
    <div>
      <div className="flex flex-wrap justify-center m-10">
        {data.map((quiz) => {
          const remap: AppCardType = {
            title: quiz.title,
            key: quiz.uuid,
            previewImg: "/tda.png",
          };

          return (
            <AppCard appCard={remap} key={remap.title} buttonLabel="">
              <Button onClick={() => handleStartQuiz(quiz.uuid)}>
                Spustit kvíz
              </Button>
            </AppCard>
          );
        })}
      </div>
    </div>
  );
};

export default SearchQuiz;
