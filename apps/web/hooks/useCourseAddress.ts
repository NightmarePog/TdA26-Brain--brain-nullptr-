"use client";

import { usePathname } from "next/navigation";

type UseCourseAddressReturnType = {
  courseUuid: string;
  addressingTo: "materials" | "quizzes" | "feed" | "none" | "user-results";
  addressingToUuid?: string; // změnil jsem na string, protože z URL to je string
};

const useCourseAddress = (): UseCourseAddressReturnType => {
  const pathname = usePathname(); // "/courses/c1a1f001-1111-4aaa-8aaa-000000000001/quizzes/1"
  const segments = pathname.split("/").filter(Boolean);

  const courseUuid = segments[1] || null;
  if (!courseUuid)
    throw new Error("useCourseAddress is only usable in the space of 'course'");

  const addressingToSegment = segments[2];

  const addressingTo = [
    "materials",
    "quizzes",
    "feed",
    "user-results",
  ].includes(addressingToSegment)
    ? (addressingToSegment as "materials" | "quizzes" | "feed" | "user-results")
    : "none";

  const addressingToUuid = segments[3];

  return { courseUuid, addressingTo, addressingToUuid };
};

export default useCourseAddress;
