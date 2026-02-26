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
import ModuleList from "./moduleList/moduleList";
import ModuleListHeader from "./moduleList/moduleListHeader";
import ModuleAction from "./moduleList/moduleListItem";
import { Button } from "@/components/ui/button";
import ModuleListAction from "./moduleList/ModuleListAction";
import ModuleListItem from "./moduleList/moduleListItem";

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
        <ModuleList>
          <ModuleListHeader>Module 1: Introduction</ModuleListHeader>
          <ModuleListItem type="pdf">
            <ModuleListAction>bwa</ModuleListAction>
          </ModuleListItem>
          <ModuleListItem type="word">
            <ModuleListAction>bwa</ModuleListAction>
          </ModuleListItem>
          <ModuleListItem type="pdf">
            <ModuleListAction>bwa</ModuleListAction>
          </ModuleListItem>
        </ModuleList>
      </div>
    </div>
  );
};

export default ModuleLayout;
