"use client";

import { useEffect, useState } from "react";
import PageTitle from "../ui/typography/pageTitle";
import { Input } from "../ui/input";
import { Button } from "@/components/ui/button";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Switch } from "../ui/switch";
import { Checkbox } from "../ui/checkbox";
import { Plus } from "lucide-react";
import { X } from "phosphor-react";
import {
  QuizUpdateRequest,
  MultipleChoiceQuestionCreateRequest,
  SingleChoiceQuestionCreateRequest,
  Question,
  MultipleChoiceQuestion,
  SingleChoiceQuestionAnswer,
  SingleChoiceQuestion,
} from "@/types/api/quizzes";
import { useQuery } from "@tanstack/react-query";
import { MessageError } from "../ui/errorComponents";

interface DashboardQuizLayoutProps {
  onSubmit: (update: Question) => void;
  questionNumber: number;
  questionUuid: string;
  questionData: Question | undefined;
}

const DashboardQuestionEditLayout = ({
  onSubmit,
  questionNumber,
  questionUuid,
  questionData,
}: DashboardQuizLayoutProps) => {
  const [multipleOptions, setMultipleOptions] = useState(
    questionData?.type === "multipleChoice" || false,
  );
  const [options, setOptions] = useState<string[]>(
    questionData!.options.map((num) => String(num)),
  );
  const [name, setName] = useState(questionData?.question || "");

  const [correctIndex, setCorrectIndex] = useState<number | null>(null);
  const [correctIndices, setCorrectIndices] = useState<number[]>([]);

  const addOption = () => {
    setOptions((prev) => [...prev, ""]);
  };

  const removeLastOption = () => {
    setOptions((prev) => (prev.length > 2 ? prev.slice(0, -1) : prev));
    setCorrectIndices((prev) => prev.filter((i) => i < options.length - 1));
    if (correctIndex === options.length - 1) {
      setCorrectIndex(null);
    }
  };

  const updateOption = (idx: number, value: string) => {
    setOptions((prev) => prev.map((opt, i) => (i === idx ? value : opt)));
  };

  const submit = () => {
    if (!name.trim()) return;

    const data = multipleOptions
      ? ({
          uuid: questionUuid,
          type: "multipleChoice",
          question: name,
          options,
          correctIndices,
        } satisfies MultipleChoiceQuestion)
      : ({
          uuid: questionUuid,
          type: "singleChoice",
          question: name,
          options,
          correctIndex: correctIndex ?? 0,
        } satisfies SingleChoiceQuestion);
    onSubmit(data);
  };

  if (questionData === undefined)
    return <MessageError message="Bohužel jsme nenašli tuto otázku" />;
  return (
    <div className="flex flex-col min-h-screen p-6 bg-background w-full">
      <PageTitle>Quiz</PageTitle>

      <div className="mx-auto w-[80%] space-y-6">
        <div className="flex justify-between items-center">
          <h2 className="font-semibold text-md">Otázka {questionNumber}</h2>

          <div className="flex items-center gap-2">
            <span className="text-sm">více odpovědí</span>
            <Switch
              checked={multipleOptions}
              onCheckedChange={(checked) => {
                setMultipleOptions(checked);
                setCorrectIndex(null);
                setCorrectIndices([]);
              }}
            />
          </div>
        </div>

        <Input
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="text-sm"
          placeholder="Zadejte text otázky…"
        />

        <RadioGroup className="space-y-3">
          {options.map((opt, idx) => (
            <div key={idx} className="flex items-center gap-3">
              {multipleOptions ? (
                <Checkbox
                  checked={correctIndices.includes(idx)}
                  onCheckedChange={(checked) =>
                    setCorrectIndices((prev) =>
                      checked ? [...prev, idx] : prev.filter((i) => i !== idx),
                    )
                  }
                />
              ) : (
                <RadioGroupItem
                  value={String(idx)}
                  checked={correctIndex === idx}
                  onClick={() => setCorrectIndex(idx)}
                />
              )}

              <Input
                className="text-sm"
                placeholder={`Odpověď ${idx + 1}`}
                value={opt}
                onChange={(e) => updateOption(idx, e.target.value)}
              />
            </div>
          ))}
        </RadioGroup>

        <div className="flex gap-2">
          <Button size="sm" onClick={addOption}>
            <Plus />
          </Button>

          <Button size="sm" variant="destructive" onClick={removeLastOption}>
            <X />
          </Button>
        </div>

        <div className="flex justify-end gap-2 pt-6">
          <Button variant="destructive">Zrušit</Button>
          <Button onClick={submit}>Uložit</Button>
        </div>
      </div>
    </div>
  );
};

export default DashboardQuestionEditLayout;
