const insertQuestionAnswerData = (
  originalQuestionOptionData: string[][],
  questionNumber: number,
  selectedOptions: string[],
) => {
  const updatedQuestionOptionData = [...originalQuestionOptionData];
  updatedQuestionOptionData[questionNumber] = selectedOptions;
  return updatedQuestionOptionData;
};

export default insertQuestionAnswerData;
