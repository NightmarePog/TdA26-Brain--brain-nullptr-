import type { CoursePreviewProps } from "@/types/course";
import CoursePreview from "../ui/courseCard";
import SectionTitle from "../ui/typography/sectionTitle";

interface props {
  title: string;
  coursesPreview: CoursePreviewProps[];
}

const CourseSection = ({ title, coursesPreview }: props) => {
  return (
    <>
      <SectionTitle className="pb-0 pt-5">{title}</SectionTitle>
      <div className="flex justify-center">
        <div className="sm:flex gap-2 my-2 w-full overflow-hidden">
          <CoursePreview coursePreviewInfo={coursesPreview} />
        </div>
      </div>
    </>
  );
};

export default CourseSection;
