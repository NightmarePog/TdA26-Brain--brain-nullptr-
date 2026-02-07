import SectionTitle from "@/components/typography/sectionTitle";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/api/quizzes";
import { ArrowLeft, ArrowRight } from "phosphor-react";
import OptionsLayout from "./optionLayout";

import { useEffect } from "react";
import insertQuestionAnswerData, {
  setVisited,
} from "./hooks/insertQuestionAnswerData";
import { QuestionUserAnswerType } from "./quizLayout";

interface QuestionLayoutProps {
  questions: Question[];
  questionNumber: number | string;
  questionsUserAnswers: QuestionUserAnswerType[];
  setQuestionsUserAnswers: React.Dispatch<
    React.SetStateAction<QuestionUserAnswerType[]>
  >;
  setValidPage: (page: number) => void;
}

const QuestionLayout = ({
  questions,
  questionNumber,
  questionsUserAnswers,
  setQuestionsUserAnswers,
  setValidPage,
}: QuestionLayoutProps) => {
  useEffect(() => {
    if (typeof questionNumber !== "number") return;
    setQuestionsUserAnswers((prev) => {
      if (prev[questionNumber].visited) return prev;

      return setVisited(prev, questionNumber, prev[questionNumber].answers);
    });
  }, [questionNumber, setQuestionsUserAnswers]);

  if (typeof questionNumber !== "number") return; //shouldn't happen
  const selectedQuestion = questions[questionNumber];

  return (
    <div>
      <SectionTitle>{selectedQuestion.question}</SectionTitle>

      <OptionsLayout
        key={selectedQuestion.uuid}
        question={selectedQuestion}
        selectedOptions={questionsUserAnswers[questionNumber].answers}
        setSelectedOptions={(newAnswers) => {
          setQuestionsUserAnswers((prev) =>
            insertQuestionAnswerData(prev, questionNumber, newAnswers),
          );
        }}
      />

      <div className="p-5 flex gap-2">
        <Button
          onClick={() => setValidPage(questionNumber - 1)}
          disabled={questionNumber === 0}
        >
          <ArrowLeft />
        </Button>

        <Button
          onClick={() => setValidPage(questionNumber + 1)}
          disabled={questionNumber === questions.length - 1}
        >
          <ArrowRight />
        </Button>
      </div>
    </div>
  );
};

export default QuestionLayout;
