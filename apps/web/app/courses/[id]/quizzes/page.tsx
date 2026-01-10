"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import PageTitle from "@/components/ui/typography/pageTitle";

import { quizzes } from "@/const/quizzes";
import { usePathname, useRouter } from "next/navigation";

const QuizzesPage = () => {
  const router = useRouter();
  const pathname = usePathname();
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
              onClick: () => router.push(`${pathname}/${quiz.uuid}`),
            };
            return remap;
          })}
        />
      </div>
    </div>
  );
};

export default QuizzesPage;
