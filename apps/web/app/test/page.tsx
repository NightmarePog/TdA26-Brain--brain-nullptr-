/** eslint-disable react-hooks/set-state-in-effect */
"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Trash2, Plus } from "lucide-react";

// =============================
// API TYPES
// =============================

type QuestionType = "singleChoice" | "multipleChoice";

type SingleChoiceQuestionCreateRequest = {
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex: number;
};

type MultipleChoiceQuestionCreateRequest = {
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices: number[];
};

type QuizCreateRequest = {
  title: string;
  questions: (
    | SingleChoiceQuestionCreateRequest
    | MultipleChoiceQuestionCreateRequest
  )[];
};

type Quiz = {
  uuid: string;
  title: string;
  questions: Question[];
};

type SingleChoiceQuestion = {
  uuid: string;
  type: "singleChoice";
  question: string;
  options: string[];
  correctIndex?: number;
};

type MultipleChoiceQuestion = {
  uuid: string;
  type: "multipleChoice";
  question: string;
  options: string[];
  correctIndices?: number[];
};

type Question = SingleChoiceQuestion | MultipleChoiceQuestion;

type Api = {
  quizzes: {
    get: (
      courseUuid: string,
      moduleUuid: string,
      quizUuid: string,
    ) => Promise<Quiz>;

    post: (
      courseUuid: string,
      moduleUuid: string,
      data: QuizCreateRequest,
    ) => Promise<Quiz>;

    update: (
      courseUuid: string,
      moduleUuid: string,
      quizUuid: string,
      data: QuizCreateRequest,
    ) => Promise<Quiz>;
  };
};

// =============================
// EDITOR STATE
// =============================

type QuestionState = {
  uuid?: string;
  type: QuestionType;
  question: string;
  options: string[];
  correctIndex?: number;
  correctIndices?: number[];
};

// =============================
// PAGE
// =============================

export default function QuizEditorPage({ api }: { api: Api }) {
  const params = useParams();
  const router = useRouter();

  const courseUuid = params.courseUuid as string;
  const moduleUuid = params.moduleUuid as string;
  const quizUuid = params.quizUuid as string | undefined;

  const [title, setTitle] = useState("");
  const [questions, setQuestions] = useState<QuestionState[]>([]);
  const [loading, setLoading] = useState(true);

  const editing = Boolean(quizUuid);

  useEffect(() => {
    if (!editing || !quizUuid) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setLoading(false);
      return;
    }

    api.quizzes
      .get(courseUuid, moduleUuid, quizUuid)
      .then((quiz) => {
        setTitle(quiz.title);

        const mapped: QuestionState[] = quiz.questions.map((q) => ({
          uuid: q.uuid,
          type: q.type,
          question: q.question,
          options: [...q.options],
          correctIndex: q.type === "singleChoice" ? q.correctIndex : undefined,
          correctIndices:
            q.type === "multipleChoice" ? (q.correctIndices ?? []) : undefined,
        }));

        setQuestions(mapped);
      })
      .finally(() => setLoading(false));
  }, [editing, quizUuid, courseUuid, moduleUuid, api]);

  function addQuestion(type: QuestionType) {
    setQuestions((prev) => [
      ...prev,
      {
        type,
        question: "",
        options: ["", ""],
        correctIndex: 0,
        correctIndices: [],
      },
    ]);
  }

  function deleteQuestion(index: number) {
    setQuestions((prev) => prev.filter((_, i) => i !== index));
  }

  function updateQuestion(index: number, data: Partial<QuestionState>) {
    setQuestions((prev) =>
      prev.map((q, i) => (i === index ? { ...q, ...data } : q)),
    );
  }

  function addOption(qi: number) {
    setQuestions((prev) =>
      prev.map((q, i) =>
        i === qi ? { ...q, options: [...q.options, ""] } : q,
      ),
    );
  }

  function deleteOption(qi: number, oi: number) {
    setQuestions((prev) =>
      prev.map((q, i) => {
        if (i !== qi) return q;

        const options = q.options.filter((_, index) => index !== oi);

        if (q.type === "singleChoice") {
          let correctIndex = q.correctIndex ?? 0;

          if (correctIndex === oi) correctIndex = 0;
          if (correctIndex > oi) correctIndex--;

          return { ...q, options, correctIndex };
        }

        const correctIndices =
          q.correctIndices
            ?.filter((idx) => idx !== oi)
            .map((idx) => (idx > oi ? idx - 1 : idx)) ?? [];

        return { ...q, options, correctIndices };
      }),
    );
  }

  async function save() {
    const payload: QuizCreateRequest = {
      title,
      questions: questions.map((q) => {
        if (q.type === "singleChoice") {
          return {
            type: "singleChoice",
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex ?? 0,
          };
        }

        return {
          type: "multipleChoice",
          question: q.question,
          options: q.options,
          correctIndices: q.correctIndices ?? [],
        };
      }),
    };

    if (editing && quizUuid) {
      await api.quizzes.update(courseUuid, moduleUuid, quizUuid, payload);
    } else {
      await api.quizzes.post(courseUuid, moduleUuid, payload);
    }

    router.back();
  }

  if (loading) return <div>Loading...</div>;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold">
        {editing ? "Edit Quiz" : "Create Quiz"}
      </h1>

      <Input
        placeholder="Quiz title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
      />

      {questions.map((q, qi) => (
        <Card key={qi} className="bg-card/50">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Question {qi + 1}</CardTitle>

            <Button
              size="icon"
              variant="destructive"
              onClick={() => deleteQuestion(qi)}
            >
              <Trash2 size={16} />
            </Button>
          </CardHeader>

          <CardContent className="space-y-4">
            <Textarea
              placeholder="Question text"
              value={q.question}
              onChange={(e) => updateQuestion(qi, { question: e.target.value })}
            />

            {q.type === "singleChoice" && (
              <RadioGroup
                value={String(q.correctIndex)}
                onValueChange={(v) =>
                  updateQuestion(qi, { correctIndex: Number(v) })
                }
              >
                {q.options.map((opt, oi) => (
                  <div key={oi} className="flex items-center gap-2">
                    <RadioGroupItem value={String(oi)} id={`q${qi}-${oi}`} />

                    <Input
                      value={opt}
                      onChange={(e) => {
                        const updated = [...q.options];
                        updated[oi] = e.target.value;
                        updateQuestion(qi, { options: updated });
                      }}
                    />

                    <Button
                      size="icon"
                      variant="ghost"
                      onClick={() => deleteOption(qi, oi)}
                    >
                      <Trash2 size={16} />
                    </Button>
                  </div>
                ))}
              </RadioGroup>
            )}

            {q.type === "multipleChoice" && (
              <div className="space-y-2">
                {q.options.map((opt, oi) => {
                  const checked = (q.correctIndices ?? []).includes(oi);

                  return (
                    <div key={oi} className="flex items-center gap-2">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={() => {
                          let arr = q.correctIndices ?? [];

                          if (arr.includes(oi)) {
                            arr = arr.filter((i) => i !== oi);
                          } else {
                            arr = [...arr, oi];
                          }

                          updateQuestion(qi, { correctIndices: arr });
                        }}
                      />

                      <Input
                        value={opt}
                        onChange={(e) => {
                          const updated = [...q.options];
                          updated[oi] = e.target.value;
                          updateQuestion(qi, { options: updated });
                        }}
                      />

                      <Button
                        size="icon"
                        variant="destructive"
                        onClick={() => deleteOption(qi, oi)}
                      >
                        <Trash2 size={16} />
                      </Button>
                    </div>
                  );
                })}
              </div>
            )}

            <Button
              size="sm"
              onClick={() => addOption(qi)}
              className="flex gap-2"
            >
              <Plus size={16} /> dát možnost
            </Button>
          </CardContent>
        </Card>
      ))}

      <div className="flex gap-2">
        <Button onClick={() => addQuestion("singleChoice")}>
          <Plus />
          Otázka s jednou odpovědí
        </Button>

        <Button onClick={() => addQuestion("multipleChoice")}>
          <Plus />
          Otázka s více odpovědmi
        </Button>
      </div>

      <Button onClick={save} className="w-full">
        Save Quiz
      </Button>
    </div>
  );
}
