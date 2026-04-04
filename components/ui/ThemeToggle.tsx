"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { MoonStar, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";
import { useThemeTransition } from "@/hooks/useThemeTransition";
import { cn } from "@/lib/utils";

export function ThemeToggle(): React.ReactNode {
  const { resolvedTheme, setTheme } = useTheme();
  const transitionTheme = useThemeTransition();
  const [mounted, setMounted] = useState(false);

  // Only render the theme-aware icon after hydration to avoid a server/client
  // mismatch — next-themes' resolvedTheme is always undefined on the server.
  useEffect(() => {
    setMounted(true);
  }, []);

  const currentTheme = resolvedTheme === "dark" ? "dark" : "light";
  const nextTheme = currentTheme === "dark" ? "light" : "dark";

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.97 }}
      whileHover={{ y: -1 }}
      transition={{ type: "spring", stiffness: 400, damping: 26 }}
      onClick={() => transitionTheme(nextTheme, setTheme)}
      className={cn(
        "inline-flex h-11 w-11 items-center justify-center rounded-full border border-border bg-paper text-ink shadow-sm transition-all hover:shadow-md dark:border-border-dark dark:bg-surface dark:text-paper",
      )}
      aria-label="Toggle theme"
    >
      <AnimatePresence mode="wait" initial={false}>
        {/* Render a fixed-size invisible placeholder until mounted so the
            server and client always produce identical HTML. */}
        {!mounted ? (
          <span className="inline-flex size-5" aria-hidden="true" />
        ) : currentTheme === "dark" ? (
          <motion.span
            key="sun"
            initial={{ opacity: 0, rotate: -90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: 90, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <SunMedium className="size-5" aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="moon"
            initial={{ opacity: 0, rotate: 90, scale: 0.7 }}
            animate={{ opacity: 1, rotate: 0, scale: 1 }}
            exit={{ opacity: 0, rotate: -90, scale: 0.7 }}
            transition={{ duration: 0.2 }}
            className="inline-flex"
          >
            <MoonStar className="size-5" aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </motion.button>
  );
}
