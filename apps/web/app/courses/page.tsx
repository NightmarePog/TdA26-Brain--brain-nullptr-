"use client";
import CourseSection from "@/components/layouts/courseSection";
import CoursePreviewCarousel from "@/components/ui/courseCard";
import CoursePreview from "@/components/ui/coursePreview";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import {
  CoursesConstLastViewed,
  CoursesConstRecommended,
} from "@/const/courses";
import { useState } from "react";

const CoursesPage = () => {
  const data = CoursesConstLastViewed;
  const [query, setQuery] = useState("");
  const filtered = data.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
      {/** TODO: course filtering */}
      <div className="flex justify-center p-5">
        <Input
          placeholder="Vyhledávat..."
          className="w-100"
          type="search"
          onChange={(e) => {
            setQuery(e.target.value);
          }}
        />
      </div>
      <div>
        {data ? (
          <div className="flex justify-center">
            <div className="sm:flex gap-2 my-2 w-full overflow-hidden">
              <CoursePreviewCarousel coursePreviewInfo={filtered || data} />
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
