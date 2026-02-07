import { Button } from "@/components/ui/button";
import { QuestionUserAnswerType } from "./quizLayout";

interface QuestionBarLayoutProps {
  questionNumber: number | string;
  questionsUserAnswers: QuestionUserAnswerType[];
  setValidPage: (num: number) => void;
  questionsCount: number;
}

const getStyleOnStatus = (
  status: QuestionUserAnswerType,
  currentQuestionNumber: number,
  buttonIndex: number,
) => {
  console.log("status::", status, buttonIndex);
  if (currentQuestionNumber === buttonIndex) return "bg-blue-500";
  if (status.visited === false) return "bg-gray-600";
  if (status.answered === false) return "bg-yellow-600";
  return "bg-green-500";
};

const QuestionBarLayout = ({
  questionNumber,
  questionsUserAnswers,
  setValidPage,
  questionsCount,
}: QuestionBarLayoutProps) => {
  if (typeof questionNumber === "string") return; // shouldn't happen
  return (
    <div className="flex justify-center gap-2">
      {Array.from({ length: questionsCount }).map((_, index) => (
        <Button
          key={index}
          variant={"default"}
          className={getStyleOnStatus(
            questionsUserAnswers[index],
            questionNumber,
            index,
          )}
          onClick={() => setValidPage(index)}
        >
          {index + 1}
        </Button>
      ))}
    </div>
  );
};

export default QuestionBarLayout;
