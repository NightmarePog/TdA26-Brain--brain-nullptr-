"use client";

import DashboardQuestionLayout from "@/components/layouts/dashboardQuestion";
import useCourseAddress from "@/hooks/useCourseAddress";

import { useState } from "react";

const QuizPage = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();

  return <DashboardQuestionLayout submit={() => null} />;
};

export default QuizPage;
