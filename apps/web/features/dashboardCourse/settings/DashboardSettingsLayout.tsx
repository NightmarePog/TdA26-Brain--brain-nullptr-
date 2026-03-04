import { Button } from "@/components/ui/button";
import ModuleList from "@/features/moduleList/moduleList";
import ModuleListAction from "@/features/moduleList/ModuleListAction";
import ModuleListHeader from "@/features/moduleList/moduleListHeader";
import ModuleListItem from "@/features/moduleList/moduleListItem";
import DashboardSettingsFeed from "./DashboardSettingsFeed";

const DashboardSettingsLayout = () => {
  return (
    <div className="flex flex-col lg:flex-row w-full">
      <div className="w-full lg:w-5/6 flex justify-center">
        <div className="w-full max-w-5xl my-30">
          <ModuleList>
            <ModuleListHeader>Module 1: vývoj v jazyce</ModuleListHeader>

            <ModuleListItem>
              <ModuleListAction type="pdf">informace o IDE</ModuleListAction>
              <Button>test</Button>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleListAction type="word">pip</ModuleListAction>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleListAction type="word">pip</ModuleListAction>
              <Button>bwa</Button>
            </ModuleListItem>

            <ModuleListItem>
              <ModuleListAction type="pdf">python interpreter</ModuleListAction>
            </ModuleListItem>

            <ModuleListItem className="bg-secondary/30 py-5">
              <div className="w-full flex justify-center">
                <Button>Přidat Kurz/modul</Button>
              </div>
            </ModuleListItem>
          </ModuleList>
        </div>
      </div>

      <div className="w-full lg:w-1/6">
        <DashboardSettingsFeed />
      </div>
    </div>
  );
};

export default DashboardSettingsLayout;
