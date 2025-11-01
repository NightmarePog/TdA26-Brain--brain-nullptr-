
import { CoursesConst } from "@/const/courses"
import CoursePreview from "../ui/coursePreview"

const CoursePreviewLayout = () => {
    return <div className="flex">
        {CoursesConst.map((v,i) => <CoursePreview key={i} coursePreviewInfo={v}/>)}
    </div>
}

export default CoursePreviewLayout