"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/ui/typography/pageTitle";

import { quizzes } from "@/const/quizzes";
import { usePathname, useRouter } from "next/navigation";

const QuizzesPage = () => {
  const router = useRouter();
  const pathname = usePathname();

  const handleStartQuiz = (quizUuid: string) => {
    router.push(`${pathname}/${quizUuid}`);
  };

  return (
    <div>
      <PageTitle>Kvízy</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        {quizzes.map((quiz) => {
          const remap: AppCardType = {
            title: quiz.title,
            key: quiz.uuid,
            previewImg: "/tda.png",
          };

          return (
            <AppCard appCard={remap} key={remap.title} buttonLabel="">
              <Button
                className="btn-primary" // přidej třídy podle UI knihovny
                onClick={() => handleStartQuiz(quiz.uuid)}
              >
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
