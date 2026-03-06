"use client";

import { Lock, Play } from "lucide-react";
import { BaseCard } from "../baseCard/BaseCard";
import { BaseCardHeader } from "../baseCard/BaseCardHeader";
import { BaseCardImage } from "../baseCard/BaseCardImage";
import BaseCardLock from "../baseCard/BaseCardLock";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { CourseStates } from "@/types/api/courses";

interface CardTestProps {
  cardKey: string;
  title: string;
  description?: string;
  state: CourseStates;
  token?: string; // pokud je potřeba auth
}

const CourseCard = ({
  cardKey,
  title,
  description,
  state,
  token,
}: CardTestProps) => {
  const router = useRouter();
  const [imageSrc, setImageSrc] = useState<string>(
    `/api/courses/${cardKey}/image`,
  );

  useEffect(() => {
    if (!token) return; // veřejný endpoint, nemusíme dělat fetch

    const fetchImage = async () => {
      try {
        const res = await fetch(`/api/courses/${cardKey}/image`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        if (!res.ok) throw new Error("Failed to fetch image");

        const blob = await res.blob();
        setImageSrc(URL.createObjectURL(blob));
      } catch (err) {
        console.error(err);
      }
    };

    fetchImage();

    // cleanup blob URL při odchodu komponenty
    return () => {
      if (imageSrc.startsWith("blob:")) URL.revokeObjectURL(imageSrc);
    };
  }, [cardKey, token]);

  return (
    <BaseCard CardKey={cardKey}>
      <BaseCardImage src={imageSrc} alt="course cover">
        <div
          className="h-full flex justify-center items-center transition duration-500 ease-out hover:scale-110 cursor-pointer"
          onClick={() => router.push(`/courses/${cardKey}`)}
        >
          <Play size={60} fill="white" className="text-white" />
        </div>
      </BaseCardImage>

      <BaseCardHeader title={title} description={description} />
      {state === "draft" && <BaseCardLock />}
    </BaseCard>
  );
};

export default CourseCard;
