import CoursePreview from "../ui/coursePreview"
import PageTitle from "../ui/typography/pageTitle"
import SectionTitle from "../ui/typography/sectionTitle"
const a = [0,1,2,3,4,5,6,7,8,9,10]
const HomePage = () => {
   return (
      <>
      <PageTitle>domů</PageTitle>
      <div className="mx-15">
         <div className="border-y">
         <SectionTitle>sekce</SectionTitle>
            <div className="flex justify-center">
               <div className="sm:flex gap-2 my-2 overflow-hidden">
                  {a.map((i) => <CoursePreview coursePreviewInfo={{
                     id: 0,
                     name: "",
                     description: ""
                  }}
                  key={i}
                  />)}
               
               </div>
            </div>
         </div>
      </div>
   </>
   )
}

export default HomePage