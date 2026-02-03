"use client";

import QuizLayout from "@/components/layouts/quizLayout";
import QuizSummaryLayout from "@/components/layouts/quizSummaryLayout";
import { MessageError } from "@/components/ui/errorComponents";
import QuizQuery from "@/features/course/quizzes/user/quizQuery";
const QuizPage = () => {
  return <QuizQuery />;
};

export default QuizPage;
