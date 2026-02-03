import {
  MultipleChoiceQuestion,
  Question,
  SingleChoiceQuestion,
} from "@/types/api/quizzes";
import getQuestionType from "./getQuestionType";
import MultiQuestionOptions from "./multiQuestionOptions";
import { MessageError } from "@/components/ui/errorComponents";
import SingleQuestionOptions from "./singleQuestionOptions";

interface QuestionLayoutProps {
  question: Question;
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
}

const QuestionLayout = ({
  question,
  selectedOptions,
  setSelectedOptions,
}: QuestionLayoutProps) => {
  const questionType = getQuestionType(question);

  switch (questionType) {
    case "multipleChoice":
      return (
        <MultiQuestionOptions
          question={question as MultipleChoiceQuestion}
          selectedOptions={selectedOptions}
          setSelectedOptions={setSelectedOptions}
        />
      );
    case "singleChoice":
      return (
        <SingleQuestionOptions
          question={question as SingleChoiceQuestion}
          selectedOptions={selectedOptions?.[0] ?? ""}
          setSelectedOptions={(option) =>
            setSelectedOptions(option ? [option] : [])
          }
        />
      );
    default:
      return <MessageError message="neznámý typ otázky" />;
  }
};

export default QuestionLayout;
