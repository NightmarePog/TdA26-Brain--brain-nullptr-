import CourseSection from "@/components/layouts/courseSection";
import NotFound from "@/components/ui/errorComponents";
import {
  CoursesConstLastViewed,
  CoursesConstRecommended,
} from "@/const/courses";

const CoursesPage = () => {
  const data = null;
  return (
    <div>
      {data ? (
        <CourseSection title={"bwa"} coursesPreview={data} />
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default CoursesPage;
