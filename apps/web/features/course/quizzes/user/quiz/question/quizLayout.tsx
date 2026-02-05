import { Quiz } from "@/types/api/quizzes";
import { useState } from "react";
import SubmitQuizLayout from "./submit/submit";
import QuestionLayout from "./questionLayout";
import QuestionBarLayout from "./questionBarLayout";

const QuizLayout = ({ quiz }: { quiz: Quiz }) => {
  const [questionsUserAnswers, setQuestionsUserAnswers] = useState<string[][]>(
    Array.from({ length: quiz.questions.length }, () => ["unvisited"]),
  );
  const [questionNumber, setQuestionNumber] = useState<number | string>(0);

  const lastQuestionIndex = quiz.questions.length - 1;

  const setValidPage = (newPage: number) => {
    if (newPage < 0) return;
    if (newPage > lastQuestionIndex) {
      setQuestionNumber("confirm");
      return;
    }
    setQuestionNumber(newPage);
  };

  if (questionNumber === "confirm")
    return (
      <div>
        <QuestionBarLayout
          questionsCount={quiz.questions.length}
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
        questionsCount={quiz.questions.length}
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
