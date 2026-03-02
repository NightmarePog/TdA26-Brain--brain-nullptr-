"use client";

import { Separator } from "@/components/ui/separator";
import ModulePageHeader from "./modulesPageHeader";
import useSafeQuery from "@/features/query/useSafeQuery";
import { ModulesRecieve } from "@/types/api/modules";
import { CoursesApi } from "@/lib/api";
import useCourseAddress from "@/hooks/useCourseAddress";
import ErrorLabel from "@/components/typography/errorText";
import ModuleList from "./moduleList/moduleList";
import ModuleListHeader from "./moduleList/moduleListHeader";
import ModuleListAction from "./moduleList/ModuleListAction";
import ModuleListItem from "./moduleList/moduleListItem";
import PageTitle from "@/components/typography/pageTitle";
import { ModuleChart } from "./moduleChart";
import ModuleQuizStartDialog from "./moduleList/moduleQuizStartDialog";

const ModuleLayout = () => {
  const { courseUuid } = useCourseAddress();

  const { queryStatus, StatusElement, data } = useSafeQuery<ModulesRecieve>({
    queryFn: () => CoursesApi.modules.getAll(courseUuid),
    queryKey: ["courses", courseUuid],
    enabled: !!courseUuid,
  });

  if (queryStatus !== "finished") return StatusElement;
  if (!data) return <ErrorLabel>Žádné data</ErrorLabel>;

  return (
    <div className="p-6">
      <div className="lg:flex gap-8">
        <div className="flex-1">
          <ModulePageHeader
            doneModules={0}
            unfinishedModules={0}
            courseName="Python základy"
            courseDescription="v tomto kurzu se dozvíte úplné základy programovacího jazyka Python"
            notificationCount={1}
            moduleCount={1}
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
