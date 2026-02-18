"use client";

import * as React from "react";
import Image from "next/image";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import Text from "@/components/typography/text";
import { motion, AnimatePresence } from "framer-motion";
import { Badge } from "../ui/badge";
import { Button } from "../ui/button";

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
        <Card className="relative mx-auto max-w-sm pt-0 w-80 overflow-hidden">
          <div className="absolute inset-0 z-30 aspect-video bg-black/35" />
          <img
            src="https://avatar.vercel.sh/shadcn1"
            alt="Event cover"
            className="relative z-20 aspect-video w-full object-cover brightness-60 grayscale dark:brightness-40"
          />
          <CardHeader>
            <CardAction>
              <Badge variant="secondary">Featured</Badge>
            </CardAction>
            <CardTitle>{appCard.title}</CardTitle>
            <CardDescription>{appCard.description}</CardDescription>
          </CardHeader>
          <CardFooter>{children}</CardFooter>
        </Card>
      </motion.div>
    </AnimatePresence>
  );
};

export default AppCard;
