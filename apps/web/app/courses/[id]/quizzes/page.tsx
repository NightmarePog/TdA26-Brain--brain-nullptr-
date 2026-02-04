"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/typography/pageTitle";

import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";

const QuizzesPage = () => {
  const router = useRouter();
  const pathname = usePathname();
  const { courseUuid, addressingToUuid } = useCourseAddress();

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["feed", addressingToUuid],
    queryFn: () => CoursesApi.quizzes.getAll(courseUuid),
  });

  const handleStartQuiz = (quizUuid: string) => {
    router.push(`${pathname}/${quizUuid}`);
  };

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p>{error.message}</p>;
  return (
    <div>
      <PageTitle>Kvízy</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        {data!.map((quiz) => {
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

export default QuizzesPage;
