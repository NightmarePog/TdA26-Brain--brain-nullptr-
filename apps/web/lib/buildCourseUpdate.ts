import {
  Question,
  Quiz,
  QuizUpdateRequest,
  SingleChoiceQuestionCreateRequest,
  MultipleChoiceQuestionCreateRequest,
} from "@/types/api/quizzes";

/**
 * DELETE – odstraní otázku podle UUID
 */
export const buildCourseDelete = (
  original: Quiz,
  questionUuid: string,
): QuizUpdateRequest => {
  return {
    title: original.title,
    questions: original.questions
      .filter((q) => q.uuid !== questionUuid)
      .map(mapQuestionToUpdateRequest),
  };
};

/**
 * UPDATE – upraví existující otázku podle UUID
 */
export const buildCourseUpdate = (
  original: Quiz,
  editedQuestion: Question,
): QuizUpdateRequest => {
  const updatedQuestions = original.questions.map((q) =>
    q.uuid === editedQuestion.uuid ? editedQuestion : q,
  );

  return {
    title: original.title,
    questions: updatedQuestions.map(mapQuestionToUpdateRequest),
  };
};

/**
 * Převod frontend otázky na backend typ
 */
export function mapQuestionToUpdateRequest(
  q: Question,
): SingleChoiceQuestionCreateRequest | MultipleChoiceQuestionCreateRequest {
  if (q.type === "singleChoice") {
    return {
      type: "singleChoice",
      question: q.question,
      options: q.options,
      correctIndex: q.correctIndex ?? 0,
    };
  } else {
    return {
      type: "multipleChoice",
      question: q.question,
      options: q.options,
      correctIndices: q.correctIndices ?? [],
    };
  }
}

/**
 * Přidání nové primitivní single-choice otázky
 */
export const buildCourseUpdateWithNewQuestion = (
  original: Quiz,
  newQuestionText: string = "Nová otázka",
): QuizUpdateRequest => {
  const newQuestion: SingleChoiceQuestionCreateRequest = {
    type: "singleChoice",
    question: newQuestionText,
    options: ["Odpověď 1", "Odpověď 2"],
    correctIndex: 0,
  };

  const updatedQuestions = [
    ...original.questions.map(mapQuestionToUpdateRequest),
    newQuestion,
  ];

  return {
    title: original.title,
    questions: updatedQuestions,
  };
};
