import { Lock, Play } from "lucide-react";
import { BaseCard } from "../baseCard/BaseCard";
import { BaseCardHeader } from "../baseCard/BaseCardHeader";
import { BaseCardImage } from "../baseCard/BaseCardImage";
import { Badge } from "@/components/ui/badge";
import { CourseStates } from "@/types/api/courses";
import BaseCardLock from "../baseCard/BaseCardLock";
import { useRouter } from "next/navigation";

interface DashboardCardProps {
  cardKey: string;
  title: string;
  description?: string;
  state: CourseStates;
  imageSrc: string;
}

const DashboardCard = ({
  cardKey,
  title,
  description,
  state,
  imageSrc,
}: DashboardCardProps) => {
  const router = useRouter();
  return (
    <BaseCard CardKey={cardKey}>
      <BaseCardImage
        src={imageSrc || "https://avatar.vercel.sh/shadcn1"}
        alt="event cover"
      >
        <div
          className="h-full flex justify-center items-center transition duration-500 ease-out hover:scale-110 cursor-pointer"
          onClick={() => router.push(`/dashboard/${cardKey}`)}
        >
          <Play size={60} fill="white" className="text-white" />
        </div>
      </BaseCardImage>
      <BaseCardHeader title={title} description={`${description}\n${state}`} />
    </BaseCard>
  );
};

export default DashboardCard;
