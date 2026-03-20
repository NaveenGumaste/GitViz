"use client";

import { motion } from "framer-motion";
import { FolderTree, CalendarDays, Users, PieChart } from "lucide-react";
import { useRepoStore, type RepoTab } from "@/stores/repoStore";
import { cn } from "@/lib/utils";

const tabs: Array<{ key: RepoTab; label: string; icon: React.ReactNode }> = [
  { key: "tree", label: "File Tree", icon: <FolderTree className="size-4" aria-hidden="true" /> },
  { key: "heatmap", label: "Commit Activity", icon: <CalendarDays className="size-4" aria-hidden="true" /> },
  { key: "contributors", label: "Contributors", icon: <Users className="size-4" aria-hidden="true" /> },
  { key: "languages", label: "Languages", icon: <PieChart className="size-4" aria-hidden="true" /> },
];

export function TabNav(): React.ReactNode {
  const activeTab = useRepoStore((state) => state.activeTab);
  const setActiveTab = useRepoStore((state) => state.setActiveTab);

  return (
    <div className="flex flex-wrap gap-2 rounded-[1.75rem] border border-border bg-paper/80 p-2 shadow-sm backdrop-blur-sm dark:border-border-dark dark:bg-surface/80">
      {tabs.map((tab) => {
        const isActive = tab.key === activeTab;

        return (
          <motion.button
            key={tab.key}
            type="button"
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setActiveTab(tab.key)}
            className={cn(
              "relative inline-flex items-center gap-2 rounded-full px-4 py-3 text-sm font-medium transition-colors",
              isActive ? "text-ink dark:text-paper" : "text-muted hover:text-ink dark:text-paper/68 dark:hover:text-paper",
            )}
          >
            {isActive ? (
              <motion.span
                layoutId="tab-indicator"
                className="absolute inset-0 -z-10 rounded-full bg-surface-light shadow-[0_8px_20px_rgba(0,0,0,0.08)] dark:bg-surface dark:shadow-[0_8px_20px_rgba(0,0,0,0.22)]"
              />
            ) : null}
            <span className={cn("inline-flex", isActive ? "text-accent" : "")}>{tab.icon}</span>
            <span>{tab.label}</span>
          </motion.button>
        );
      })}
    </div>
  );
}
