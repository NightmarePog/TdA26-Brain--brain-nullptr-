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
} from "@/types/api/quizzes";
import { MessageError } from "../ui/errorComponents";
import useCourseAddress from "@/hooks/useCourseAddress";
import { Checkbox } from "../ui/checkbox";
import PageTitle from "../typography/pageTitle";

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
  const [selectedSingle, setSelectedSingle] = useState<string | undefined>(
    undefined,
  );
  const [selectedMulti, setSelectedMulti] = useState<number[]>([]);
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
          } as SingleChoiceQuestionAnswer;
        } else {
          return {
            uuid: q.uuid,
            selectedIndices: [],
          } as MultipleChoiceQuestionAnswer;
        }
      });
    }
  }, [quiz]);

  // Sync selection with stored answer when question changes
  useEffect(() => {
    if (!quiz) return;
    const answer = answerRef.current.answers[questionNumber];
    if (!answer) return;

    if ("selectedIndex" in answer) {
      setSelectedSingle(
        answer.selectedIndex >= 0 ? String(answer.selectedIndex) : undefined,
      );
      setSelectedMulti([]);
    } else if ("selectedIndices" in answer) {
      setSelectedSingle(undefined);
      setSelectedMulti(answer.selectedIndices ?? []);
    }
  }, [questionNumber, quiz]);

  if (!quiz) return <MessageError message="Quiz does not exist" />;

  const nextQuestion = () => {
    const answer = answerRef.current.answers[questionNumber];
    if (!answer) return;

    // Validate selection
    if (
      ("selectedIndex" in answer && selectedSingle === undefined) ||
      ("selectedIndices" in answer && selectedMulti.length === 0)
    ) {
      setError("není vybrána žádná odpověď");
      return;
    }
    setError(null);

    // Save selection
    if ("selectedIndex" in answer && selectedSingle !== undefined) {
      answer.selectedIndex = Number(selectedSingle);
    } else if ("selectedIndices" in answer) {
      answer.selectedIndices = selectedMulti;
    }

    // Move to next question or finish
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

        {question.type === "singleChoice" ? (
          <RadioGroup
            value={selectedSingle}
            onValueChange={setSelectedSingle}
            defaultValue=""
            className="flex flex-col space-y-3"
          >
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <RadioGroupItem value={String(idx)} />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </RadioGroup>
        ) : (
          <div className="flex flex-col space-y-3">
            {question.options.map((opt, idx) => (
              <label
                key={idx}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Checkbox
                  checked={selectedMulti.includes(idx)}
                  onCheckedChange={(checked) => {
                    if (checked) {
                      setSelectedMulti([...selectedMulti, idx]);
                    } else {
                      setSelectedMulti(selectedMulti.filter((i) => i !== idx));
                    }
                  }}
                />
                <span className="text-sm">{opt}</span>
              </label>
            ))}
          </div>
        )}

        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {questionNumber + 1} / {quiz.questions.length}
            </span>
          </div>
          <Progress
            value={((questionNumber + 1) / quiz.questions.length) * 100}
            className="h-2 rounded-full"
          />

          <div className="flex justify-end mt-4">
            <Button onClick={nextQuestion}>
              {questionNumber + 1 !== quiz.questions.length
                ? "Next →"
                : "Finish →"}
            </Button>
          </div>
        </div>
        {error && <p className="text-red-500 mt-2">{error}</p>}
      </div>
    </div>
  );
};

export default QuizLayout;
