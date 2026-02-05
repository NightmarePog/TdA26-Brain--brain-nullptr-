import { Question } from "@/types/api/quizzes";

interface submitQuizFuncProps {
  questionAnswers: string[][];
  questions: Question[];
}

const submitQuiz = ({
  questionAnswers,
  questions,
}: submitQuizFuncProps): boolean[] => {
  const result = questions.map((question, questionIndex) => {
    if (question.type === "singleChoice") {
      return questionAnswers[questionIndex].length === 1; // TODO
    }
  });
  return false;
};

export default submitQuiz;
