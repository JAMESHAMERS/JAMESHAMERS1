"use client";

import type { ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { usePathname } from "@/shared/i18n/navigation";

/**
 * Wraps route content in a small fade/slide so navigating between module
 * pages feels intentional rather than an abrupt swap. Kept subtle and fast
 * (150ms) — motion here is polish, not a feature to notice.
 */
export function PageTransition({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait" initial={false}>
      <motion.div
        key={pathname}
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.15, ease: "easeOut" }}
      >
        {children}
      </motion.div>
    </AnimatePresence>
  );
}
