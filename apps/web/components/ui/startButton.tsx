"use client";

import { motion } from "framer-motion";
import { Sparkles } from "lucide-react";
import { useRouter } from "next/navigation";

export default function StartButton() {
  const router = useRouter();
  return (
    <motion.button
      onClick={() => router.push("/home")}
      whileHover={{
        scale: 1.1,
        boxShadow: "0 0 30px rgba(34,136,209,0.7)",
      }}
      whileTap={{ scale: 0.95 }}
      animate={{
        scale: [1, 1.05, 1],
        transition: { duration: 1.5, repeat: Infinity },
      }}
      className="relative px-10 py-4 text-xl font-extrabold rounded-2xl
                 text-[(--primary-color)] border-2
                 bg-[linear-gradient(to_right,rgba(0,112,187,0.9),rgba(34,136,209,0.9),rgba(73,179,180,0.9))]
                 shadow-lg overflow-hidden uppercase tracking-wide ml-20 backdrop-blur-sm cursor-pointer"
    >
      <span className="relative z-10 flex items-center gap-2">
        <Sparkles className="w-5 h-5 animate-pulse" />
        Začít studovat teď!
      </span>

      <span className="absolute inset-0 overflow-hidden rounded-2xl"></span>
    </motion.button>
  );
}
