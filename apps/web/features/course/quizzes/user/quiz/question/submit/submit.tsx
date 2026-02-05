import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";

const SubmitQuizLayout = () => {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-xl">Odeslat kvíz</CardTitle>
        </CardHeader>

        <CardContent>
          <p className="text-center text-foreground">
            Jste si jistí, že chcete svůj kvíz odeslat? Po odeslání už nepůjde
            upravovat.
          </p>
        </CardContent>

        <CardFooter className="flex justify-center gap-2">
          <Button variant="default" className="">
            Odeslat kvíz
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};

export default SubmitQuizLayout;
