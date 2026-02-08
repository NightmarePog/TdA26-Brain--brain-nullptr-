import QuizLayout from "@/features/course/quizzes/user/quiz/question/quizLayout";
import useSafeQuery from "@/features/query/useSafeQuery";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { Quiz } from "@/types/api/quizzes";

const QuizQuery = () => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const { data, StatusElement, queryStatus } = useSafeQuery<Quiz>({
    queryFn: () => CoursesApi.quizzes.get(courseUuid, addressingToUuid!),
    queryKey: ["quiz", courseUuid, addressingToUuid],
    enabled: !!addressingToUuid,
  });

  return (
    <div className="flex justify-center items-center w-full">
      {queryStatus === "finished" && data ? (
        <QuizLayout quiz={data} />
      ) : (
        StatusElement || "failed"
      )}
    </div>
  );
};

export default QuizQuery;
