"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "phosphor-react";
import Text from "@/components/ui/typography/text";
import { motion, AnimatePresence } from "framer-motion";
import { CourseDetails } from "@/types/api/courses";
import { useRouter } from "next/navigation";

export type AppCardType = {
  title: string;
  description?: string;
  key: unknown;
  previewImg: string;
  onClick: () => void;
};

export interface AppCardProps {
  appCards: AppCardType[];
}

const AppCard: React.FC<AppCardProps> = ({ appCards }) => {
  return (
    <div className="flex flex-wrap  justify-center">
      <AnimatePresence mode="popLayout">
        {appCards.map((card, index) => (
          <motion.div
            key={(card.key as string) ?? index}
            layout
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: -10 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="px-4 mb-6"
          >
            <Card className="group h-125 w-87.5 p-0 overflow-hidden border border-card-foreground hover:shadow-xl transition-all rounded-3xl">
              <div className="relative h-62.5 w-full overflow-hidden">
                <Image
                  src={card.previewImg}
                  alt={card.title}
                  fill
                  className="object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <CardContent className="flex flex-col justify-between h-62.5 p-6">
                <div>
                  <Text className="text-xl font-semibold mb-2 line-clamp-1">
                    {card.title}
                  </Text>
                  <Text className="text-base text-foreground/70 line-clamp-3">
                    {card.description}
                  </Text>
                </div>

                <div className="flex justify-end mt-4">
                  <Button
                    onClick={() => card.onClick()}
                    variant="secondary"
                    className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2 rounded-full cursor-pointer px-4 py-2"
                  >
                    <span>Explore</span>
                    <ArrowRight size={20} weight="bold" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
};

export default AppCard;
