import { Quiz } from "@/types/api/quizzes";
import { useState } from "react";
import SubmitQuizLayout from "./submit/submit";
import QuestionLayout from "./question/questionLayout";
import QuestionBarLayout from "./questionBarLayout";

const QuizLayout = ({ quiz }: { quiz: Quiz }) => {
  const [questionsUserAnswers, setQuestionsUserAnswers] = useState<string[][]>(
    [],
  );
  const [questionNumber, setQuestionNumber] = useState(0);
  const [onSubmit, setOnSubmit] = useState<boolean>(false);

  const lastQuestionIndex = quiz.questions.length - 1;

  const setValidPage = (newPage: number) => {
    if (newPage < 0) return;
    if (newPage > lastQuestionIndex) {
      setOnSubmit(true);
      return;
    }
    setQuestionNumber(newPage);
  };

  if (onSubmit)
    return (
      <div>
        <QuestionBarLayout
          questionNumber={questionNumber}
          questionsUserAnswers={questionsUserAnswers}
          setValidPage={setValidPage}
        />
        <SubmitQuizLayout />
      </div>
    );
  return (
    <div>
      <QuestionBarLayout
        questionNumber={questionNumber}
        questionsUserAnswers={questionsUserAnswers}
        setValidPage={setValidPage}
      />
      <QuestionLayout
        questions={quiz.questions}
        questionNumber={questionNumber}
        questionsUserAnswers={questionsUserAnswers}
        setQuestionsUserAnswers={setQuestionsUserAnswers}
        setValidPage={setValidPage}
      />
    </div>
  );
};

export default QuizLayout;
