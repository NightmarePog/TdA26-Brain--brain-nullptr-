"use client";

import * as React from "react";
import Image from "next/image";
import { Card, CardContent } from "@/components/ui/card";
import Text from "@/components/typography/text";
import { motion, AnimatePresence } from "framer-motion";

export type AppCardType = {
  title: string;
  description?: string;
  key: unknown;
  previewImg: string;
  buttonLabel?: string;
};

export interface AppCardProps {
  appCard: AppCardType;
  buttonLabel?: string;
  children?: React.ReactNode;
}

const AppCard: React.FC<AppCardProps> = ({
  appCard,

  children,
}) => {
  return (
    <div className="flex flex-wrap  justify-center">
      <AnimatePresence mode="popLayout">
        <motion.div
          key={appCard.key as string}
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
                src={appCard.previewImg}
                alt={appCard.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>

            <CardContent className="flex flex-col justify-between h-62.5 p-6">
              <div>
                <Text className="text-xl font-semibold mb-2 line-clamp-1">
                  {appCard.title}
                </Text>
                <Text className="text-base text-foreground/70 line-clamp-3 whitespace-pre-line">
                  {appCard.description}
                </Text>
              </div>

              <div className="flex justify-end mt-4">{children}</div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default AppCard;
