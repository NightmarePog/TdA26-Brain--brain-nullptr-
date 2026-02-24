import { Lock, Play } from "lucide-react";
import { BaseCard } from "../baseCard/BaseCard";
import { BaseCardHeader } from "../baseCard/BaseCardHeader";
import { BaseCardImage } from "../baseCard/BaseCardImage";
import { Badge } from "@/components/ui/badge";
import { CourseStates } from "@/types/api/courses";
import BaseCardLock from "../baseCard/BaseCardLock";
import { useRouter } from "next/navigation";

interface CardTestProps {
  cardKey: string;
  title: string;
  description?: string;
  state: CourseStates;
}

const CourseCard = ({ cardKey, title, description, state }: CardTestProps) => {
  const router = useRouter();
  return (
    <BaseCard CardKey={cardKey}>
      <BaseCardImage src="https://avatar.vercel.sh/shadcn1" alt="event cover">
        <div
          className="h-full flex justify-center items-center transition duration-500 ease-out hover:scale-110 cursor-pointer"
          onClick={() => router.push(`/courses/${cardKey}`)}
        >
          <Play size={60} fill="white" />
        </div>
      </BaseCardImage>
      <BaseCardHeader title={title} description={description} />
      {state === "draft" && <BaseCardLock />}
    </BaseCard>
  );
};

export default CourseCard;
