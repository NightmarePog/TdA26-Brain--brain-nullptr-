import { Course, CourseStates } from "@/types/api/courses";
import CardTest from "./CourseCard";
import CourseCard from "./CourseCard";

interface CoursesCourseViewProps {
  data: Course[];
}

const CoursesCourseView = ({ data }: CoursesCourseViewProps) => {
  return (
    <div className="flex justify-center m-10">
      <div className="grid max-w-400 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.map((data) => (
          <CourseCard
            cardKey={data.uuid}
            key={data.uuid}
            title={data.name}
            description={data.description}
            state={data.state as CourseStates}
          />
        ))}
      </div>
    </div>
  );
};

export default CoursesCourseView;
