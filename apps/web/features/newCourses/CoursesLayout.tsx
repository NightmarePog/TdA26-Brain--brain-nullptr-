import { Separator } from "@/components/ui/separator";
import CoursesHeader from "./CoursesHeader";
import CoursesFiltering from "./CoursesFiltering";
import CoursesCourseView from "./CoursesCourseView";
import useSafeQuery from "../query/useSafeQuery";
import { Course } from "@/types/api/courses";
import { CoursesApi } from "@/lib/api";
import ErrorLabel from "@/components/typography/errorText";

const CoursesLayout = () => {
  const { queryStatus, StatusElement, data } = useSafeQuery<Course[]>({
    queryFn: () => CoursesApi.getAll(),
    queryKey: ["courses"],
    enabled: true,
  });

  if (queryStatus !== "finished") return StatusElement;
  if (!data) return <ErrorLabel>Žádné data</ErrorLabel>;

  return (
    <div className="p-10">
      <CoursesHeader />
      <Separator className="my-5" />
      <CoursesFiltering data={data}>
        {(filteredCourses) => <CoursesCourseView data={filteredCourses} />}
      </CoursesFiltering>
    </div>
  );
};

export default CoursesLayout;
