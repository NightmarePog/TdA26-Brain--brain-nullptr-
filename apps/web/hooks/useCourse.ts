import { CoursesApi } from "@/lib/api";
import { Material } from "@/types/api/materials";
import { useQuery } from "@tanstack/react-query";

export const useCourseMaterials = (
  courseUuid?: string,
  materialUuid?: string,
) => {
  return useQuery<Material>({
    queryKey: ["course", courseUuid, "material", materialUuid],
    queryFn: () => CoursesApi.materials.get(courseUuid!, materialUuid!),
    enabled: !!courseUuid && !!materialUuid,
  });
};

// -------------------------------
// Hook: Course Feed
// -------------------------------
export const useCourseFeed = (courseUuid: string) => {
  /*
  return useQuery<Feed[]>({
    queryKey: ["course", courseUuid, "feed"],
    queryFn: () => CoursesApi.feed.get(courseUuid!),
    enabled: !!courseUuid,
  });
  */
};

// -------------------------------
// Hook: Course Quiz
// -------------------------------
export const useCourseQuiz = (courseUuid: string) => {
  /*
  return useQuery<Quiz>({
    queryKey: ["course", courseUuid, "quiz"],
    queryFn: () => CoursesApi.quiz.get(courseUuid!),
    enabled: !!courseUuid,
  });
  */
};
