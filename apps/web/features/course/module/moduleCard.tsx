import { Button } from "@/components/ui/button";
import ModuleList from "@/features/moduleList/moduleList";
import ModuleListAction from "@/features/moduleList/ModuleListAction";
import ModuleListHeader from "@/features/moduleList/moduleListHeader";
import ModuleListItem from "@/features/moduleList/moduleListItem";
import ModuleQuizStartDialog from "@/features/moduleList/moduleQuizStartDialog";
import { Module } from "node:vm";

interface CourseModuleCardProps {
  name: string;
}

const ModuleCard = ({ name }: CourseModuleCardProps) => {
  return (
    <ModuleList>
      <ModuleListHeader>{name}</ModuleListHeader>

      <ModuleListItem>
        <ModuleListAction type="pdf">informace o IDE</ModuleListAction>
        <Button>test</Button>
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
  );
};
