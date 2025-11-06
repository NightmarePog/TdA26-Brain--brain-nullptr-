import { CoursePreviewProps } from "@/types/course";

interface props {
  coursePreviewInfo: CoursePreviewProps;
}

const CoursePreview = ({ coursePreviewInfo }: props) => {
  return (
    <div className="h-20 w-50 border">
      <p>{coursePreviewInfo.name}</p>
      <p>{coursePreviewInfo.description}</p>
    </div>
  );
};

export default CoursePreview;
