"use client";
import MaterialCard from "@/features/course/materials/materialCard";
import PageTitle from "@/components/ui/typography/pageTitle";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { Material } from "@/types/api/materials";
import useSafeQuery from "@/features/query/useSafeQuery";

const UserMaterials = () => {
  const { courseUuid } = useCourseAddress();
  const { data, StatusElement, queryStatus } = useSafeQuery<Material[]>({
    queryFn: () => CoursesApi.materials.getAll(courseUuid),
    queryKey: ["materials"],
    enabled: true,
  });

  return (
    <div>
      <PageTitle>Materiály</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        {queryStatus !== "finished" ? (
          StatusElement
        ) : (
          <MaterialCard materials={data as Material[]} />
        )}
      </div>
    </div>
  );
};

export default UserMaterials;
