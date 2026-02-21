import AppCard from "@/components/cards/appCard";
import useSafeQuery from "../query/useSafeQuery";
import QuizAnswers from "@/app/dashboard/[id]/user-results/page";
import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import { Course } from "@/types/api/courses";

interface CoursesCourseViewProps {
  data: Course[];
}

const CoursesCourseView = ({ data }: CoursesCourseViewProps) => {
  return (
    <div className="flex justify-center m-10">
      <div className="grid max-w-400 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.map((data) => (
          <AppCard
            appCard={{
              title: data.name,
              buttonLabel: "začít",
              key: data.uuid,
              previewImg: "https://avatar.vercel.sh/shadcn1",
            }}
            key={data.uuid}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesCourseView;
