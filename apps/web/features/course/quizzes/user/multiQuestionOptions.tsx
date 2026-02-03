import { Checkbox } from "@/components/ui/checkbox";
import { MultipleChoiceQuestion } from "@/types/api/quizzes";

interface MultiQuestionOptionsProps {
  question: MultipleChoiceQuestion;
  selectedOptions: string[];
  setSelectedOptions: (options: string[]) => void;
}

const MultiQuestionOptions = ({
  question,
  selectedOptions,
  setSelectedOptions,
}: MultiQuestionOptionsProps) => {
  const toggleOption = (option: string, checked: boolean) => {
    let newSelected: string[];
    if (checked) {
      newSelected = selectedOptions.includes(option)
        ? selectedOptions
        : [...selectedOptions, option];
    } else {
      newSelected = selectedOptions.filter((o) => o !== option);
    }
    setSelectedOptions(newSelected);
  };

  return (
    <div className="flex flex-col space-y-3">
      {question.options.map((option) => (
        <label
          key={option}
          className="flex items-center space-x-2 cursor-pointer"
        >
          <Checkbox
            checked={selectedOptions.includes(option)}
            onCheckedChange={(checked) =>
              toggleOption(option, checked === true)
            }
          />
          <span className="text-sm">{option}</span>
        </label>
      ))}
    </div>
  );
};

export default MultiQuestionOptions;
