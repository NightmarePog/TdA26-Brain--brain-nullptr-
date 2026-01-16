"use client";

import DashboardQuestionLayout from "@/components/layouts/dashboardQuestion";
import DashboardQuizLayout from "@/components/layouts/dashboardQuizLayout";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { buildCourseDelete, buildCourseUpdate } from "@/lib/buildCourseUpdate";

import { Question } from "@/types/api/quizzes";
import { useQuery } from "@tanstack/react-query";
import { useSearchParams } from "next/navigation";

import { useMemo } from "react";
import { toast } from "sonner";

const QuizPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const searchParams = useSearchParams();
  const questionUuid = searchParams.get("question");

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["dashboardQuizzes", addressingToUuid],
    queryFn: () => CoursesApi.quizzes.get(courseUuid, addressingToUuid!),
  });

  const questionData = useMemo(() => {
    return data?.questions.find((question) => question.uuid === questionUuid);
  }, [data?.questions, questionUuid]);

  const questionIndex = useMemo(() => {
    const index = data?.questions.findIndex(
      (question) => question.uuid === questionUuid,
    );
    return index !== undefined && index >= 0 ? index : 0;
  }, [data?.questions, questionUuid]);

  if (isLoading) return <p>loading...</p>;
  if (isError) return <p>{error.message}</p>;

  if (!questionUuid) return <DashboardQuizLayout data={data!} />;

  const editQuestion = (question: Question) => {
    if (!data) return;

    const editData = buildCourseUpdate(data, question);

    toast.promise(
      CoursesApi.quizzes.put(courseUuid, addressingToUuid!, editData),
      {
        loading: "Ukládám otázku…",
        success: "Otázka byla úspěšně upravena",
        error: (err) =>
          err?.response?.data?.message ?? "Nepodařilo se uložit změny",
      },
    );
  };
  return (
    <DashboardQuestionLayout
      onSubmit={(question) => editQuestion(question)}
      questionNumber={questionIndex}
      questionData={questionData}
      questionUuid={questionData!.uuid}
    />
  );
};

export default QuizPage;
