"use client";
import { Card } from "@/components/ui/card";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Quiz } from "@/types/api/quizzes";
import { useState } from "react";
import PageTitle from "../ui/typography/pageTitle";

interface QuizLayoutProps {
  quiz: Quiz;
}

const QuizLayout = ({ quiz }: QuizLayoutProps) => {
  const [questionNumber, setQuestionNumber] = useState<number>(0);

  const nextQuestion = () => {
    // send to the server smthinggg
    if (questionNumber + 1 === quiz.questions.length) return;
    setQuestionNumber(questionNumber + 1);
  };
  return (
    <div className="flex flex-col h-screen p-6 bg-background w-full ">
      {/* Header */}
      <PageTitle>Kvíz</PageTitle>

      {/* Question Card */}
      <div className="relative top-30 mx-auto w-[80%]">
        <div className="flex justify-between items-center mb-4">
          <h2 className="font-semibold text-md">Otázka č. {questionNumber}</h2>
        </div>
        <p className="text-sm mb-6">{quiz.title}</p>

        <RadioGroup className="flex flex-col space-y-3">
          {quiz.questions[questionNumber].options.map((opt, idx) => (
            <label
              key={idx}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <RadioGroupItem value={`option${idx}`} />
              <span className="text-sm ">{opt}</span>
            </label>
          ))}
        </RadioGroup>

        {/* Footer: Progress + Navigation */}
        <div className="mt-6 flex flex-col space-y-4">
          <div className="flex justify-between items-center text-sm text-gray-600">
            <span>
              {questionNumber} otázek z {quiz.questions.length}
            </span>
          </div>
          <Progress
            value={(questionNumber / quiz.questions.length) * 100}
            className="h-2 rounded-full"
          />

          <div className="flex justify-end mt-4">
            {questionNumber + 1 !== quiz.questions.length ? (
              <Button
                onClick={() => {
                  nextQuestion();
                }}
              >
                Další →
              </Button>
            ) : (
              <Button>dokončit →</Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizLayout;
