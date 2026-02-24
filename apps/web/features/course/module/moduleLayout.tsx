"use client";

import { Separator } from "@/components/ui/separator";
import ModulesPageHeader from "./modulesPageHeader";
import ModuleCardLayout from "./moduleCardLayout";
import { useEffect } from "react";
import useSafeQuery from "@/features/query/useSafeQuery";
import { Module, ModulesRecieve } from "@/types/api/modules";
import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import ErrorLabel from "@/components/typography/errorText";

const ModuleLayout = () => {
  const { courseUuid } = useCourseAddress();
  const { queryStatus, StatusElement, data } = useSafeQuery<ModulesRecieve>({
    queryFn: () => CoursesApi.modules.getAll(courseUuid),
    queryKey: ["courses"],
    enabled: true,
  });

  if (queryStatus !== "finished") return StatusElement;
  if (!data) return <ErrorLabel>Žádné data</ErrorLabel>;

  return (
    <div className="w-full gap-6 p-6">
      <div className="flex-1 space-y-5">
        <ModulesPageHeader
          courseName={data.courseName}
          moduleCount={data.count}
          courseDescription={data.description}
          doneModules={5}
          unfinishedModules={10}
          notificationCount={0}
        />
        <Separator />
        <ModuleCardLayout
          cards={data.modules.map((module) => ({
            name: module.name,
            description: module.description || "",
          }))}
        />
      </div>
    </div>
  );
};

export default ModuleLayout;
