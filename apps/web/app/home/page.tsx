import CourseSection from "@/components/layouts/courseSection";
import PageTitle from "@/components/ui/typography/pageTitle";
import {
  CoursesConstLastViewed,
  CoursesConstNew,
  CoursesConstRecommended,
} from "@/const/courses";

export default async function Home() {
  return (
    <main className="mx-15">
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
    </main>
  );
}
