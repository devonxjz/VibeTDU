import { useEffect } from "react";
import { motion } from "framer-motion";
import { FlaskConical } from "lucide-react";
import { CATEGORY_GROUPS } from "@/constants/chemicals";

interface PouringAnimationProps {
  chemicalName: string;
  chemicalCategory: string;
  onComplete: () => void;
}

export function PouringAnimation({
  chemicalName,
  chemicalCategory,
  onComplete,
}: PouringAnimationProps) {
  // Find color for the category
  const group = CATEGORY_GROUPS.find((g) => g.key === chemicalCategory);
  const colorVar = group ? `var(${group.colorVar})` : "var(--cat-acid)";

  useEffect(() => {
    // Complete the animation after the sequence finishes
    const timer = setTimeout(() => {
      onComplete();
    }, 1200); // Wait for the whole animation (pour + finish)
    return () => clearTimeout(timer);
  }, [onComplete]);

  return (
    <div className="pointer-events-none absolute inset-0 z-50 flex items-center justify-center">
      {/* The animated bottle */}
      <motion.div
        className="relative -ml-16 -mt-32"
        initial={{ rotate: 0, scale: 1, x: -50, y: -50 }}
        animate={{
          rotate: [-45, -60, -60, 0],
          x: [-50, -20, -20, -50],
          y: [-50, -30, -30, -50],
        }}
        transition={{ duration: 1.2, times: [0, 0.2, 0.8, 1] }}
      >
        <div
          className="flex h-16 w-16 items-center justify-center rounded-xl shadow-2xl"
          style={{ backgroundColor: colorVar }}
        >
          <FlaskConical className="h-8 w-8 text-navy" strokeWidth={1.8} />
        </div>
      </motion.div>

      {/* The liquid stream */}
      <motion.div
        className="absolute"
        style={{ backgroundColor: colorVar, width: 4, transformOrigin: "top" }}
        initial={{ scaleY: 0, opacity: 0, x: -20, y: -40 }}
        animate={{
          scaleY: [0, 1, 1, 0],
          opacity: [0, 0.8, 0.8, 0],
          y: [-40, -40, 20, 20],
        }}
        transition={{ duration: 0.8, delay: 0.2, times: [0, 0.2, 0.8, 1] }}
      />
    </div>
  );
}
