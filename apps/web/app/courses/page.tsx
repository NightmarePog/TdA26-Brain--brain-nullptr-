"use client";
import CourseSection from "@/components/layouts/courseSection";
import AppCard, { AppCardType } from "@/components/ui/appCard";
import CoursePreview from "@/components/ui/coursePreview";
import NotFound from "@/components/ui/errorComponents";
import { Input } from "@/components/ui/input";
import { CoursesApi } from "@/lib/api";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useState } from "react";

const CoursesPage = () => {
  const router = useRouter();

  const [query, setQuery] = useState("");
  const { isPending, error, data } = useQuery({
    queryKey: ["allCourses"],
    queryFn: CoursesApi.getAll,
  });

  const routeToCourse = (uuid: string) => {
    router.push("courses/" + uuid);
  };

  if (error) return <p>nastala chyba: {error.message}</p>;
  if (isPending) return <p>načítaní...</p>;

  const filtered = data!.filter((item) =>
    item.name.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <>
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
              {/*remapping because the input is diffrent than output */}
              <AppCard
                appCards={filtered.map((item) => {
                  const remap: AppCardType = {
                    title: item.name,
                    description: item.description,
                    key: item.uuid,
                    previewImg: "/tda.png",
                    onClick: () => routeToCourse(item.uuid),
                  };
                  return remap;
                })}
              />
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
