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
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Separator } from "../ui/separator";

interface FeedProps {
  author: string;
  message: string;
  editable?: boolean;
  onDelete?: () => void;
}

const Feed = ({ author, message, editable, onDelete }: FeedProps) => {
  return (
    <div className="w-full  rounded-lg shadow-2xl p-6">
      <h2 className="text-lg font-semibold">{author}</h2>
      <p className="mt-2 whitespace-pre-wrap">{message}</p>
      <Separator className="my-4" />
      {editable && (
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button variant="destructive">Smazat</Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                jste si jistý že chcete pokračovat?
              </AlertDialogTitle>
              <AlertDialogDescription>
                změny jsou permanentní a jakýkoliv smazaný obsah již nelze
                vrátit.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>zrušit</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDelete!()}>
                pokračovat
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      )}
    </div>
  );
};

export default Feed;
