import { Course, CourseStates } from "@/types/api/courses";
import DashboardCard from "./dashboardCard";

interface DashboardCourseViewProps {
  data: Course[];
}

const DashboardCourseView = ({ data }: DashboardCourseViewProps) => {
  return (
    <div className="flex justify-center m-10">
      <div className="grid max-w-400 gap-10 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {data.map((data) => (
          <DashboardCard
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

export default DashboardCourseView;
