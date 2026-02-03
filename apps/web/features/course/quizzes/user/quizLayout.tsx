import { Question, Quiz } from "@/types/api/quizzes";
import QuestionLayout from "./questionLayout";
import { useState } from "react";
import insertQuestionAnswerData from "./insertQuestionAnswerData";

const QuizLayout = ({ quiz }: { quiz: Quiz }) => {
  const [questionsUserAnswers, setQuestionsUserAnswers] = useState<string[][]>(
    [],
  );
  const [questionNumber, setQuestionNumber] = useState(0);
  const selectedQuestion = quiz.questions[questionNumber];
  return (
    <div className="">
      <h3>{selectedQuestion.question}</h3>
      <QuestionLayout
        key={selectedQuestion.uuid}
        question={selectedQuestion}
        selectedOptions={questionsUserAnswers[questionNumber]}
        setSelectedOptions={(newAnswers) => {
          setQuestionsUserAnswers(
            insertQuestionAnswerData(
              questionsUserAnswers,
              questionNumber,
              newAnswers,
            ),
          );
        }}
      />
    </div>
  );
};

export default QuizLayout;
