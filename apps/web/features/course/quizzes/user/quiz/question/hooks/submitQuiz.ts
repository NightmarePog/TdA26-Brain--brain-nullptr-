import useCourseAddress from "@/hooks/useCourseAddress";
import { CoursesApi } from "@/lib/api";
import {
  MultipleChoiceQuestionAnswer,
  Question,
  QuizSubmitRequest,
  QuizSubmitResponse,
  SingleChoiceQuestionAnswer,
} from "@/types/api/quizzes";
import { QuestionUserAnswerType } from "../quizLayout";

interface submitQuizFuncProps {
  questionAnswers: QuestionUserAnswerType[];
  questions: Question[];
  courseUuid: string;
  quizUuid: string;
}

const submitQuiz = async ({
  questionAnswers,
  questions,
  courseUuid,
  quizUuid,
}: submitQuizFuncProps): Promise<QuizSubmitResponse> => {
  const data: QuizSubmitRequest = {
    answers: questions.map((question, questionIndex) => {
      if (question.type === "singleChoice") {
        return {
          uuid: question.uuid,
          selectedIndex: Number(questionAnswers[questionIndex].answers[0]),
        } as SingleChoiceQuestionAnswer;
      } else if (question.type === "multipleChoice") {
        return {
          uuid: question.uuid,
          selectedIndices: questionAnswers[questionIndex].answers.map(Number),
        } as MultipleChoiceQuestionAnswer;
      }
      throw new Error(`Unknown question type`);
    }),
  };

  const result = await CoursesApi.quizzes.postSubmit(
    courseUuid,
    quizUuid,
    data,
  );
  return result;
};

export default submitQuiz;
