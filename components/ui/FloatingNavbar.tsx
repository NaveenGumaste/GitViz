"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles, Info, ArrowUpRight, Orbit, GitBranch } from "lucide-react";
import { ThemeToggle } from "@/components/ui/ThemeToggle";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import { useEffect, useMemo, useState } from "react";
import type { ReactNode } from "react";

interface NavItem {
  label: string;
  href: string;
  icon: ReactNode;
  section?: string;
}

const navItems: NavItem[] = [
  {
    label: "Features",
    href: "/#features",
    icon: <Sparkles className="size-4" aria-hidden="true" />,
    section: "features",
  },
  {
    label: "About",
    href: "/#about",
    icon: <Info className="size-4" aria-hidden="true" />,
    section: "about",
  },
];

export function FloatingNavbar(): React.ReactNode {
  const pathname = usePathname();
  const [hash, setHash] = useState<string>("");

  useEffect(() => {
    const updateHash = (): void => {
      setHash(window.location.hash.replace("#", ""));
    };

    updateHash();
    window.addEventListener("hashchange", updateHash);
    window.addEventListener("popstate", updateHash);

    return () => {
      window.removeEventListener("hashchange", updateHash);
      window.removeEventListener("popstate", updateHash);
    };
  }, []);

  const activeSection = useMemo(() => {
    if (pathname.startsWith("/viz")) {
      return "home";
    }

    if (pathname === "/" && hash) {
      return hash;
    }

    return "home";
  }, [hash, pathname]);

  if (pathname.startsWith("/viz")) {
    return null;
  }

  return (
    <motion.nav
      initial={{ y: 36, opacity: 0, scale: 0.96 }}
      animate={{ y: 0, opacity: 1, scale: 1 }}
      transition={{ type: "spring", stiffness: 240, damping: 24 }}
      className="fixed inset-x-0 bottom-6 z-[100] flex justify-center px-4"
    >
      <div className="flex items-center gap-1.5 sm:gap-2 rounded-full border border-border/80 bg-paper/80 px-2.5 py-2 sm:px-3 shadow-[0_8px_32px_rgba(0,0,0,0.12)] backdrop-blur-xl dark:border-border-dark/80 dark:bg-surface/80 dark:shadow-[0_8px_32px_rgba(0,0,0,0.38)]">
        <Link
          href="/"
          aria-label="Home"
          className={cn(
            "group relative flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all hover:bg-accent-muted",
            activeSection === "home"
              ? "text-accent"
              : "text-muted dark:text-paper/70",
          )}
        >
          <span className="relative inline-flex">
            <GitBranch className="size-4" aria-hidden="true" />
            {activeSection === "home" ? (
              <motion.span
                layoutId="navbar-dot"
                className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent"
              />
            ) : null}
          </span>
          <span className="hidden md:inline">Home</span>
        </Link>

        {navItems.map((item) => {
          const isActive =
            pathname === "/" && activeSection === (item.section ?? "");

          return (
            <Link
              key={item.label}
              href={item.href}
              aria-label={item.label}
              className={cn(
                "group relative flex h-11 items-center gap-2 rounded-full px-4 text-sm font-medium transition-all hover:bg-accent-muted",
                isActive ? "text-accent" : "text-muted dark:text-paper/70",
              )}
            >
              <span className="relative inline-flex">
                {item.icon}
                {isActive ? (
                  <motion.span
                    layoutId="navbar-dot"
                    className="absolute -bottom-1 left-1/2 size-1.5 -translate-x-1/2 rounded-full bg-accent"
                  />
                ) : null}
              </span>
              <span className="hidden md:inline">{item.label}</span>
            </Link>
          );
        })}

        <div className="px-1">
          <ThemeToggle />
        </div>

        <Button
          href="/#repo-search"
          size="sm"
          variant="primary"
          iconRight={<ArrowUpRight className="size-4" aria-hidden="true" />}
          className="hidden sm:inline-flex"
        >
          Analyze Repo
        </Button>

        <Button
          href="/#repo-search"
          size="sm"
          variant="primary"
          className="sm:hidden px-4"
          aria-label="Analyze repository"
        >
          <Orbit className="size-4" aria-hidden="true" />
        </Button>
      </div>
    </motion.nav>
  );
}
