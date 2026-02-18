import AppCard from "@/components/cards/appCard";
import { Button } from "@/components/ui/button";
import { Course } from "@/types/api/courses";
import { useRouteToCourse } from "./routeToCourse";
import NotFound from "@/app/not-found";

interface CourseViewProps {
  filtered: Course[];
}
const CoursesView = ({ filtered }: CourseViewProps) => {
  const routeToCourse = useRouteToCourse();

  return (
    <div>
      {filtered.length > 0 ? (
        <div className="flex flex-wrap justify-center gap-2 my-2 w-full overflow-hidden">
          {/*remapping because the input is diffrent than output */}
          {filtered.map((item) => (
            <AppCard
              key={item.uuid}
              buttonLabel="Začít"
              appCard={{
                title: item.name,
                description: item.description,
                key: item.uuid,
                previewImg: "/tda.png",
              }}
            >
              <Button onClick={() => routeToCourse(item.uuid)}>Začít</Button>
            </AppCard>
          ))}
        </div>
      ) : (
        <NotFound />
      )}
    </div>
  );
};

export default CoursesView;
