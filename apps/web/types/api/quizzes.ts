export type Quiz = {
  uuid: string;
  title: string;
  attemptsCount: number;
  created_at: string;
  updated_at: string;
  updateCount: number;
  questions: Question[];
};

export type Answer = {
  uuid: string;
  quizUuid: string;
  userId?: number;
  score: number;
  maxScore: number;
  submittedAt: string;
};

export type SingleChoiceQuestion = {
  uuid: string;
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex?: number;
};

export type MultipleChoiceQuestion = {
  uuid: string;
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices?: number[];
};

export type Question = SingleChoiceQuestion | MultipleChoiceQuestion;

export type SingleChoiceQuestionAnswer = {
  uuid: string;
  selectedIndex: number;
};

export type MultipleChoiceQuestionAnswer = {
  uuid: string;
  selectedIndices: number[];
};

export type SingleChoiceQuestionCreateRequest = {
  type: "singleChoice" | "multipleChoice";
  question: string;
  options: string[];
  correctIndex: number;
};

export type MultipleChoiceQuestionCreateRequest = {
  type: "singleChoice" | "multipleChoice";
  question: string;
  options: string[];
  correctIndices: number[];
};

export type QuizCreateRequest = {
  title: string;
  questions:
    | SingleChoiceQuestionCreateRequest[]
    | MultipleChoiceQuestionCreateRequest[];
};

export type QuizUpdateRequest = {
  title?: string;
  questions?:
    | SingleChoiceQuestionCreateRequest[]
    | MultipleChoiceQuestionCreateRequest[];
};

export type QuizSubmitRequest = {
  answers: SingleChoiceQuestionAnswer[] | MultipleChoiceQuestionAnswer[];
};

export type QuizSubmitResponse = {
  quizUuid: string;
  score: number;
  maxScore: number;
  submittedAt: string;
  correctPerQuestion: boolean[];
};
