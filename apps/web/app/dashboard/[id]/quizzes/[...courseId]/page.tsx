"use client";

import QuizLayout from "@/components/layouts/quizLayout";
import QuizSummaryLayout from "@/components/layouts/quizSummaryLayout";
import { MessageError } from "@/components/ui/errorComponents";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { QuizSubmitRequest } from "@/types/api/quizzes";
import { useQuery } from "@tanstack/react-query";
import { useState } from "react";

const QuizPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const [part, setPart] = useState<number | "finished">(0);
  const [scorePercentage, setScorePercentage] = useState<number>(0);

  const { isLoading, isError, error, data } = useQuery({
    queryKey: ["quiz", addressingToUuid],
    queryFn: () =>
      CoursesApi.quizzes.get(courseUuid, addressingToUuid as string),
    enabled: !!addressingToUuid,
  });

  const submitData = async (data: QuizSubmitRequest) => {
    const result = await CoursesApi.quizzes.postSubmit(
      courseUuid,
      addressingToUuid as string,
      data,
    );
    setScorePercentage((result.score / result.maxScore) * 100);
  };

  if (isLoading) return <p>loading</p>;
  if (isError) return <MessageError message={error.message || "test"} />;
  if (part !== "finished") {
    return (
      <QuizLayout
        setQuestionNumber={setPart}
        questionNumber={part}
        quiz={data}
        submit={submitData}
      />
    );
  } else {
    return <QuizSummaryLayout percentage={scorePercentage} />;
  }
};

export default QuizPage;
