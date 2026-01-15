"use client";

import DashboardQuestionLayout from "@/components/layouts/dashboardQuestion";
import DashboardQuizLayout from "@/components/layouts/dashboardQuizLayout";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { Question } from "@/types/api/quizzes";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { useEffect, useMemo, useState } from "react";

const QuizPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const searchParams = useSearchParams();
  const questionUuid = searchParams.get("question");

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["quizzes", addressingToUuid],
    queryFn: () => CoursesApi.quizzes.get(courseUuid, addressingToUuid!),
  });

  const questionData = useMemo(() => {
    return data?.questions.find((question) => question.uuid === questionUuid);
  }, [data?.questions, questionUuid]);

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p>{error.message}</p>;

  if (!questionUuid) return <DashboardQuizLayout data={data!} />;
  return (
    <DashboardQuestionLayout
      onSubmit={() => null}
      questionNumber={1}
      questionData={questionData}
    />
  );
};

export default QuizPage;
