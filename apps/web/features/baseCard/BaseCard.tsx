import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "framer-motion";

interface BaseCardProps {
  CardKey: string;
  children?: React.ReactNode;
}

export function BaseCard({ CardKey, children }: BaseCardProps) {
  return (
    <AnimatePresence mode="popLayout">
      <motion.div
        key={CardKey}
        layout
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: -10 }}
        transition={{ duration: 0.3, ease: "easeOut" }}
        className=" mb-6"
      >
        <Card className="relative mx-auto max-w-sm pt-0 w-80 overflow-hidden bg-foreground/10">
          {children}
        </Card>
      </motion.div>
    </AnimatePresence>
  );
}
