"use client";
import MaterialCard from "@/features/course/materials/materialCard";
import PageTitle from "@/components/ui/typography/pageTitle";
import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import { Material } from "@/types/api/materials";
import useSafeQuery from "@/features/query/useSafeQuery";
import React from "react";

const UserMaterials = () => {
  const { courseUuid } = useCourseAddress();
  const data = useSafeQuery<Material[]>({
    queryFn: () => CoursesApi.materials.getAll(courseUuid),
    queryKey: ["materials"],
    enabled: true,
  });

  return (
    <div>
      <PageTitle>Materiály</PageTitle>
      <div className="flex flex-wrap justify-center m-10">
        {React.isValidElement(data) ? (
          data
        ) : (
          <MaterialCard materials={data as Material[]} />
        )}
      </div>
    </div>
  );
};

export default UserMaterials;
