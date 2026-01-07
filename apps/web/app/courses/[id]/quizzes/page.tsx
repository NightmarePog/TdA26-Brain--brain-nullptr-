"use client";
import AppCard, { AppCardType } from "@/components/ui/appCard";
import PageTitle from "@/components/ui/typography/pageTitle";

import { quizzes } from "@/const/quizzes";

const QuizzesPage = () => {
  return (
    <div>
      <PageTitle>Kvízy</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        <AppCard
          appCards={quizzes.map((quiz) => {
            const remap: AppCardType = {
              title: quiz.title,
              key: quiz.uuid,
              previewImg: "/tda.png",
              onClick: () => null,
            };
            return remap;
          })}
        />
      </div>
    </div>
  );
};

export default QuizzesPage;
