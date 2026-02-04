interface QuestionBarLayoutProps {
  questionNumber: number;
  questionsUserAnswers: string[][];
  setValidPage: (num: number) => void;
}

const QuestionBarLayout = ({
  questionNumber,
  questionsUserAnswers,
  setValidPage,
}: QuestionBarLayoutProps) => {
  return <p>hai</p>;
};

export default QuestionBarLayout;
