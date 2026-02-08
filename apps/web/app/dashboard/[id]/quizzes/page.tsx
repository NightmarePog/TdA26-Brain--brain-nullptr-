"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import PageTitle from "@/components/typography/pageTitle";
import { Button } from "@/components/ui/button";

import { quizzes } from "@/const/quizzes";
import { usePathname, useRouter } from "next/navigation";

const QuizzesPage = () => {
  const router = useRouter();
  const pathname = usePathname();
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
            <AppCard
              buttonLabel="spustis kvíz"
              appCard={remap}
              key={remap.title}
            >
              <Button onClick={() => router.push(`${pathname}/${quiz.uuid}`)}>
                Editovat
              </Button>
            </AppCard>
          );
        })}
        ;
      </div>
    </div>
  );
};

export default QuizzesPage;
