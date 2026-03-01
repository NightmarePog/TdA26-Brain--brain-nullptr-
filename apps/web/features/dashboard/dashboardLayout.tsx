import { Separator } from "@/components/ui/separator";
import CoursesFiltering from "../newCourses/CoursesFiltering";
import CoursesCourseView from "../newCourses/CoursesCourseView";
import { useQuery } from "@tanstack/react-query";
import { CoursesApi } from "@/lib/api";
import { Course } from "@/types/api/courses";
import DashboardHeader from "./dashboardHeader";

const DashboardLayout = () => {
  const { data } = useQuery<Course[]>({
    queryKey: ["dashboardCourses"],
    queryFn: () => CoursesApi.getAll(),
  });

  if (!data) return;
  return (
    <div className="p-10">
      <DashboardHeader />
      <Separator className="my-5" />
      <CoursesFiltering data={data} canAdd={true}>
        {(filteredCourses) => <CoursesCourseView data={filteredCourses} />}
      </CoursesFiltering>
    </div>
  );
};

export default DashboardLayout;
