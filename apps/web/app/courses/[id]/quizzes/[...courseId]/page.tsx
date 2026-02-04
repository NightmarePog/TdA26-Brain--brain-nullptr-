"use client";

import PageTitle from "@/components/typography/pageTitle";
import QuizQuery from "@/features/course/quizzes/user/quizQuery";
const QuizPage = () => {
  return (
    <>
      <PageTitle>Kvíz</PageTitle>
      <QuizQuery />
    </>
  );
};

export default QuizPage;
