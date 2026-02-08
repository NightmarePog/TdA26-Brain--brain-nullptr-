import { Question } from "@/types/api/quizzes";

const getQuestionType = (question: Question) => {
  return question.type;
};

export default getQuestionType;
