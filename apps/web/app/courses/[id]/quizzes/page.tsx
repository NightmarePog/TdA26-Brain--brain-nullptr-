"use client";
import AppCard, { AppCardType } from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import PageTitle from "@/components/typography/pageTitle";

import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { usePathname, useRouter } from "next/navigation";
import SearchQuiz from "@/features/course/quizzes/user/searchQuiz";

const QuizzesPage = () => {
  return <SearchQuiz />;
};

export default QuizzesPage;
