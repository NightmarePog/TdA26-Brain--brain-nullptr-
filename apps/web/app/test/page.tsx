"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type SingleChoiceQuestionCreateRequest = {
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex: number;
};

export type MultipleChoiceQuestionCreateRequest = {
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices: number[];
};

export type QuizCreateRequest = {
  title: string;
  questions: (
    | SingleChoiceQuestionCreateRequest
    | MultipleChoiceQuestionCreateRequest
  )[];
};

type QuestionDraft = {
  type: "singleChoice" | "multipleChoice";
  question: string;
  options: string[];
  correctIndex: number;
  correctIndices: number[];
};

type Props = {
  courseUuid: string;
  moduleUuid: string;
  post: (
    uuid: string,
    moduleUuid: string,
    data: QuizCreateRequest,
  ) => Promise<unknown>;
};

export default function QuizCreateForm({
  courseUuid,
  moduleUuid,
  post,
}: Props) {
  const [title, setTitle] = useState<string>("");
  const [questions, setQuestions] = useState<QuestionDraft[]>([]);

  const addQuestion = () => {
    setQuestions((prev) => [
      ...prev,
      {
        type: "singleChoice",
        question: "",
        options: ["", ""],
        correctIndex: 0,
        correctIndices: [],
      },
    ]);
  };

  const deleteQuestion = (index: number) => {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  };

  const updateQuestion = (index: number, newData: Partial<QuestionDraft>) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], ...newData };
      return updated;
    });
  };

  const updateOption = (qIndex: number, oIndex: number, value: string) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options[oIndex] = value;
      return updated;
    });
  };

  const addOption = (qIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      updated[qIndex].options.push("");
      return updated;
    });
  };

  const toggleMultipleCorrect = (qIndex: number, optionIndex: number) => {
    setQuestions((prev) => {
      const updated = [...prev];
      const arr = updated[qIndex].correctIndices;

      if (arr.includes(optionIndex)) {
        updated[qIndex].correctIndices = arr.filter((i) => i !== optionIndex);
      } else {
        updated[qIndex].correctIndices = [...arr, optionIndex];
      }

      return updated;
    });
  };

  const submit = async () => {
    const payload: QuizCreateRequest = {
      title,
      questions: questions.map((q) => {
        if (q.type === "singleChoice") {
          const result: SingleChoiceQuestionCreateRequest = {
            type: "singleChoice",
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
          };
          return result;
        }

        const result: MultipleChoiceQuestionCreateRequest = {
          type: "multipleChoice",
          question: q.question,
          options: q.options,
          correctIndices: q.correctIndices,
        };

        return result;
      }),
    };

    await post(courseUuid, moduleUuid, payload);
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Quiz</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Input
            placeholder="Quiz title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
        </CardContent>
      </Card>

      {questions.map((q, qi) => (
        <Card key={qi}>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question {qi + 1}</CardTitle>
            <Button
              variant="destructive"
              size="sm"
              onClick={() => deleteQuestion(qi)}
            >
              Delete
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <Input
              placeholder="Question text"
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            />

            <Select
              value={q.type}
              onValueChange={(val: "singleChoice" | "multipleChoice") =>
                updateQuestion(qi, { type: val })
              }
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>

              <SelectContent>
                <SelectItem value="singleChoice">Single choice</SelectItem>
                <SelectItem value="multipleChoice">Multiple choice</SelectItem>
              </SelectContent>
            </Select>

            <div className="space-y-2">
              {q.options.map((opt, oi) => (
                <div key={oi} className="flex items-center gap-2">
                  <Input
                    placeholder={`Option ${oi + 1}`}
                    value={opt}
                    onChange={(e) => updateOption(qi, oi, e.target.value)}
                  />

                  {q.type === "singleChoice" ? (
                    <RadioGroup
                      value={String(q.correctIndex)}
                      onValueChange={(v) =>
                        updateQuestion(qi, { correctIndex: Number(v) })
                      }
                    >
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem
                          value={String(oi)}
                          id={`q${qi}-${oi}`}
                        />
                        <Label htmlFor={`q${qi}-${oi}`}>Correct</Label>
                      </div>
                    </RadioGroup>
                  ) : (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        checked={q.correctIndices.includes(oi)}
                        onCheckedChange={() => toggleMultipleCorrect(qi, oi)}
                      />
                      <Label>Correct</Label>
                    </div>
                  )}
                </div>
              ))}

              <Button variant="secondary" onClick={() => addOption(qi)}>
                Add option
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-3">
        <Button onClick={addQuestion}>Add question</Button>
        <Button onClick={submit}>Create quiz</Button>
      </div>
    </div>
  );
}
