import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { ReactNode } from "react";

interface ModuleQuizStartDialogProps {
  quizName: string;
  quizDescription?: string;
  children: ReactNode;
}

const ModuleQuizStartDialog = ({
  quizName,
  quizDescription,
  children,
}: ModuleQuizStartDialogProps) => {
  return (
    <AlertDialog>
      <AlertDialogTrigger className="w-full h-full">
        {children}
      </AlertDialogTrigger>
      <AlertDialogContent size="sm">
        <AlertDialogHeader>
          <AlertDialogTitle>kvíz - {quizName}</AlertDialogTitle>
          <AlertDialogDescription className="text-foreground/70">
            {quizDescription || "potvrzením tohoto dialogu započnete kvíz"}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Zrušit</AlertDialogCancel>
          <AlertDialogAction>Začít</AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default ModuleQuizStartDialog;
