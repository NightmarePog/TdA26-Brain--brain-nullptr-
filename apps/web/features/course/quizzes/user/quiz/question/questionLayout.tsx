import SectionTitle from "@/components/typography/sectionTitle";
import { Button } from "@/components/ui/button";
import { Question } from "@/types/api/quizzes";
import { ArrowLeft, ArrowRight } from "phosphor-react";
import OptionsLayout from "./optionLayout";
import insertQuestionAnswerData from "./insertQuestionAnswerData";
import ErrorLabel from "@/components/typography/errorText";
import { useEffect, useState } from "react";

interface QuestionLayoutProps {
  questions: Question[];
  questionNumber: number;
  questionsUserAnswers: string[][];
  setQuestionsUserAnswers: (answer: string[][]) => void;
  setValidPage: (page: number) => void;
}

const QuestionLayout = ({
  questions,
  questionNumber,
  questionsUserAnswers,
  setQuestionsUserAnswers,
  setValidPage,
}: QuestionLayoutProps) => {
  const selectedQuestion = questions[questionNumber];

  useEffect(() => {
    if (questionsUserAnswers[questionNumber][0] === "unvisited") {
      setQuestionsUserAnswers(
        insertQuestionAnswerData(questionsUserAnswers, questionNumber, [
          "visited",
        ]),
      );
    }
  }, [questionsUserAnswers, setQuestionsUserAnswers, questionNumber]);

  return (
    <div>
      <SectionTitle>{selectedQuestion.question}</SectionTitle>

      <OptionsLayout
        key={selectedQuestion.uuid}
        question={selectedQuestion}
        selectedOptions={questionsUserAnswers[questionNumber] ?? []}
        setSelectedOptions={(newAnswers) => {
          setQuestionsUserAnswers(
            insertQuestionAnswerData(
              questionsUserAnswers,
              questionNumber,
              newAnswers,
            ),
          );
        }}
      />
      <div className="p-5 flex gap-2">
        <Button
          onClick={() => setValidPage(questionNumber - 1)}
          disabled={questionNumber === 0}
        >
          <ArrowLeft />
        </Button>

        {
          <Button onClick={() => setValidPage(questionNumber + 1)}>
            <ArrowRight />
          </Button>
        }
      </div>
    </div>
  );
};

export default QuestionLayout;
