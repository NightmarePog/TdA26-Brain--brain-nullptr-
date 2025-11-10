import CourseSection from "@/components/layouts/courseSection";
import CoursePreviewCarousel from "@/components/ui/courseCard";
import CoursePreview from "@/components/ui/coursePreview";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import {
  CoursesConstLastViewed,
  CoursesConstRecommended,
} from "@/const/courses";

const CoursesPage = () => {
  const data = CoursesConstLastViewed;
  return (
    <>
      {/** TODO: course filtering */}
      <div className="flex justify-center p-5">
        <Input placeholder="Vyhledávat..." className="w-100" />
      </div>
      <div>
        {data ? (
          <div className="flex justify-center">
            <div className="sm:flex gap-2 my-2 w-full overflow-hidden">
              <CoursePreviewCarousel coursePreviewInfo={data} />
            </div>
          </div>
        ) : (
          <NotFound />
        )}
      </div>
    </>
  );
};

export default CoursesPage;
