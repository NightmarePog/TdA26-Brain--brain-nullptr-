import {
  CoursesConstLastViewed,
  CoursesConstNew,
  CoursesConstRecommended,
} from "@/const/courses";
import PageTitle from "../ui/typography/pageTitle";
import CourseSection from "./courseSection";
const HomePage = () => {
  return (
    <>
      <div className="mx-15">
        <PageTitle>domů</PageTitle>
        <CourseSection
          title={"Posledně"}
          coursesPreview={CoursesConstLastViewed}
        />
        <CourseSection
          title={"Doporučeno"}
          coursesPreview={CoursesConstRecommended}
        />
        <CourseSection title={"Nové"} coursesPreview={CoursesConstNew} />
      </div>
    </>
  );
};

export default HomePage;
