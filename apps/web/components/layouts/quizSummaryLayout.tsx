"use client";
import { Button } from "@/components/ui/button";
import useCourseAddress from "@/hooks/useCourseAddress";
import Image from "next/image";
import { useRouter } from "next/navigation";

interface QuizSummaryLayoutProps {
  percentage: number;
}

const QuizSummaryLayout = ({ percentage }: QuizSummaryLayoutProps) => {
  const { courseUuid, addressingToUuid } = useCourseAddress();
  const router = useRouter();
  const getComment = (pct: number) => {
    if (pct === 100) return "Perfektní práce! 🎉";
    if (pct >= 80) return "Skvělé, jen kousek od perfektního!";
    if (pct >= 50) return "Dobrá práce, ale dá se zlepšit.";
    return "Tentokrát se to nepovedlo, zkus to příště!";
  };

  const getImg = (pct: number) => {
    if (pct === 100) return "/Icons/vector/Extreme/zarivka_extreme_modre.svg";
    if (pct >= 80) return "/Icons/vector/Hard/zarivka_hard_modra.svg";
    if (pct >= 50) return "/Icons/vector/Medium/zarivka_medium_modre.svg";
    return "/Icons/vector/Easy/zarivka_easy_modre.svg";
  };

  return (
    <div className="flex flex-col mx-auto items-center justify-center min-h-screen p-10 bg-background text-center">
      <Image
        src={getImg(percentage)}
        width={256}
        height={256}
        alt="statusImage"
        className="mb-6"
      />
      <h1 className="text-6xl font-bold mb-6">Kvíz dokončen!</h1>
      <p className="text-3xl mb-4">Dosáhli jste {percentage}% správně.</p>

      <p className="text-2xl mb-8">{getComment(percentage)}</p>

      <div className="flex gap-6">
        <Button
          onClick={() => {
            router.push(`/courses/${courseUuid}/quizzes`);
          }}
          className="px-8 py-4 text-lg"
        >
          ← Zpět
        </Button>
      </div>
    </div>
  );
};

export default QuizSummaryLayout;
