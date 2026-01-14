"use client";

import DashboardQuestionLayout from "@/components/layouts/dashboardQuestion";
import useCourseAddress from "@/hooks/useCourseAddress";

import { useState } from "react";

const QuizPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();

  return <DashboardQuestionLayout questionNumber={0} onSubmit={(a) => null} />;
};

export default QuizPage;
