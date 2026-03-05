"use client";

import ModulePageHeader from "./modulesPageHeader";

import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";

import ModuleList from "./moduleList/moduleList";
import ModuleListHeader from "./moduleList/moduleListHeader";
import ModuleListAction from "./moduleList/ModuleListAction";
import ModuleListItem from "./moduleList/moduleListItem";
import PageTitle from "@/components/typography/pageTitle";
import { ModuleChart } from "./moduleChart";
import ModuleQuizStartDialog from "./moduleList/moduleQuizStartDialog";
import { useQueries } from "@tanstack/react-query";

const ModuleLayout = () => {
  const { courseUuid } = useCourseAddress();

  const queries = useQueries({
    queries: [
      {
        queryKey: ["modules", courseUuid],
        queryFn: () => CoursesApi.modules.getAll(courseUuid),
        enabled: !!courseUuid,
      },
      {
        queryKey: ["course", courseUuid],
        queryFn: () => CoursesApi.get(courseUuid),
        enabled: !!courseUuid,
      },
    ],
  });

  const [modulesQuery, courseQuery] = queries;

  if (modulesQuery.isLoading || courseQuery.isLoading) {
    return <div>Načítání...</div>;
  }

  if (modulesQuery.isError || courseQuery.isError) {
    return <div>Chyba při načítání dat</div>;
  }

  const courseData = courseQuery.data ?? {
    name: "Modul se nenačetl",
    description: "",
  };

  return (
    <div className="p-6">
      <div className="lg:flex gap-8">
        <div className="flex-1">
          <ModulePageHeader
            doneModules={0}
            unfinishedModules={0}
            courseName={courseData.name}
            courseDescription={courseData.description}
            notificationCount={1}
            moduleCount={modulesQuery.data?.length || 0}
          />
          <ModuleChart />
        </div>

        <div className="w-px bg-gray-800" />

        <div className="flex-1">
          <PageTitle className="py-5">Moduly</PageTitle>
          <ModuleList>
            <ModuleListHeader>Module 1: vývoj v jazyce</ModuleListHeader>

            <ModuleListItem>
              <ModuleListAction type="pdf">informace o IDE</ModuleListAction>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleListAction type="word">pip</ModuleListAction>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleQuizStartDialog quizName="pip">
                <ModuleListAction type="word">pip</ModuleListAction>
              </ModuleQuizStartDialog>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleListAction type="pdf">python interpreter</ModuleListAction>
            </ModuleListItem>
          </ModuleList>
        </div>
      </div>
    </div>
  );
};

export default ModuleLayout;
