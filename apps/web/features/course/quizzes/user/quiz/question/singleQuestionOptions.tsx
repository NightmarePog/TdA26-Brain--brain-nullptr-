import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { SingleChoiceQuestion } from "@/types/api/quizzes";

interface SingleQuestionOptionsProps {
  question: SingleChoiceQuestion;
  setSelectedOptions: (option: string | null) => void;
  selectedOptions: string | null;
}

const SingleQuestionOptions = ({
  question,
  setSelectedOptions,
  selectedOptions,
}: SingleQuestionOptionsProps) => {
  return (
    <RadioGroup
      value={selectedOptions}
      onValueChange={setSelectedOptions}
      defaultValue=""
      className="flex flex-col space-y-3"
    >
      {question.options.map((opt, idx) => (
        <label key={idx} className="flex items-center space-x-2 cursor-pointer">
          <RadioGroupItem value={String(idx)} />
          <span className="text-sm">{opt}</span>
        </label>
      ))}
    </RadioGroup>
  );
};

export default SingleQuestionOptions;
