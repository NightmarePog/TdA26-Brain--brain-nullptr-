import { QuestionUserAnswerType } from "../quizLayout";

const insertQuestionAnswerData = (
  originalQuestionOptionData: QuestionUserAnswerType[],
  questionNumber: number,
  selectedOptions: string[],
): QuestionUserAnswerType[] => {
  const updatedQuestionOptionData = [...originalQuestionOptionData];

  updatedQuestionOptionData[questionNumber] = {
    ...updatedQuestionOptionData[questionNumber],
    visited: true,
    answers: selectedOptions,
    answered: true,
  };

  return updatedQuestionOptionData;
};

export const setVisited = (
  originalQuestionOptionData: QuestionUserAnswerType[],
  questionNumber: number,
  selectedOptions: string[],
): QuestionUserAnswerType[] => {
  const updatedQuestionOptionData = [...originalQuestionOptionData];

  updatedQuestionOptionData[questionNumber] = {
    ...updatedQuestionOptionData[questionNumber],
    visited: true,
    answers: selectedOptions,
    answered: originalQuestionOptionData[questionNumber].answered,
  };

  return updatedQuestionOptionData;
};

export default insertQuestionAnswerData;
