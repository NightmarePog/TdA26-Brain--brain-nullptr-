import { Button } from "@/components/ui/button";
import { Question } from "@/types/api/quizzes";

interface QuestionBarLayoutProps {
  questionNumber: number;
  questionsUserAnswers: string[][];
  setValidPage: (num: number) => void;
  questionsCount: number;
}

const getStyleOnStatus = (
  status: string[],
  currentQuestionNumber: number,
  buttonIndex: number,
) => {
  if (currentQuestionNumber === buttonIndex) return "bg-blue-500";
  if (status[0] === "unvisited") return "bg-gray-600";
  if (status[0] === "visited") return "bg-yellow-600";
  return "bg-green-500";
};

const QuestionBarLayout = ({
  questionNumber,
  questionsUserAnswers,
  setValidPage,
  questionsCount,
}: QuestionBarLayoutProps) => {
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
