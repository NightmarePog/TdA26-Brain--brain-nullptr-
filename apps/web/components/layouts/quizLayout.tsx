"use client";
import { useState, useRef, useEffect } from "react";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Quiz,
  QuizSubmitRequest,
  SingleChoiceQuestionAnswer,
  MultipleChoiceQuestionAnswer,
  MultipleChoiceQuestion,
  SingleChoiceQuestion,
} from "@/types/api/quizzes";
import PageTitle from "../ui/typography/pageTitle";
import { MessageError } from "../ui/errorComponents";
import useCourseAddress from "@/hooks/useCourseAddress";

interface QuizLayoutProps {
  quiz: Quiz | undefined;
  questionNumber: number;
  setQuestionNumber: (num: number | "finished") => void;
  submit: (answers: QuizSubmitRequest) => void;
}

const QuizLayout = ({
  quiz,
  questionNumber,
  setQuestionNumber,
  submit,
}: QuizLayoutProps) => {
  const { courseUuid } = useCourseAddress();
  const [selected, setSelected] = useState<string | undefined>(undefined);
  const [error, setError] = useState<string | null>(null);
  const answerRef = useRef<QuizSubmitRequest>({ answers: [] });

  // Initialize answers only once
  useEffect(() => {
    if (quiz && answerRef.current.answers.length === 0) {
      answerRef.current.answers = quiz.questions.map((q) => {
        if (q.type === "singleChoice") {
          return {
            uuid: q.uuid,
            selectedIndex: -1,
          } as SingleChoiceQuestionAnswer; // Správný typ odpovědi
        } else {
          return {
            uuid: q.uuid,
            selectedIndices: [],
          } as MultipleChoiceQuestionAnswer; // Správný typ odpovědi
        }
      });
    }
  }, [quiz]);

  // Sync selection with stored answer when question changes
  useEffect(() => {
    if (!quiz) return;

    const answer = answerRef.current.answers[questionNumber];
    if (!answer) return;

    const timeout = setTimeout(() => {
      if ("selectedIndex" in answer) {
        setSelected(
          answer.selectedIndex >= 0 ? String(answer.selectedIndex) : undefined,
        );
      } else {
        setSelected(undefined);
      }
    }, 0);

    return () => clearTimeout(timeout);
  }, [questionNumber, quiz]);

  if (!quiz) return <MessageError message="Quiz does not exist" />;

  const nextQuestion = () => {
    const answer = answerRef.current.answers[questionNumber];
    if (!answer) return;

    if (!selected) {
      setError("není vybrána žádná odpověď");
      return;
    } else {
      setError(null);
    }

    answer.uuid = courseUuid;

    if ("selectedIndex" in answer && selected !== undefined) {
      answer.selectedIndex = Number(selected);
    }

    if (questionNumber + 1 === quiz.questions.length) {
      submit(answerRef.current);
      setQuestionNumber("finished");
    } else {
      setQuestionNumber(questionNumber + 1);
    }
  };

  const question = quiz.questions[questionNumber];

  return (
    <div className="flex flex-col h-screen p-6 bg-background w-full">
      <PageTitle>Quiz</PageTitle>

      <div className="relative top-30 mx-auto w-[80%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-md">
            Question {questionNumber + 1}
          </h2>
        </div>
        <p className="text-sm mb-6">{question.question}</p>

        <RadioGroup
          value={selected}
          onValueChange={setSelected}
          defaultValue=""
          className="flex flex-col space-y-3"
        >
          {question.options.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <RadioGroupItem value={String(opt)} />
              <span className="text-sm">{opt}</span>
            </label>
          ))}
        </RadioGroup>

        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {questionNumber + 1} / {quiz.questions.length}
            </span>
          </div>
          <Progress
            value={(questionNumber / quiz.questions.length) * 100}
            className="h-2 rounded-full"
          />

          <div className="flex justify-end mt-4">
            {questionNumber + 1 !== quiz.questions.length ? (
              <Button onClick={nextQuestion}>Next →</Button>
            ) : (
              <Button onClick={nextQuestion}>Finish →</Button>
            )}
          </div>
        </div>
        <p className="text-red-500">{error}</p>
      </div>
    </div>
  );
};

export default QuizLayout;
