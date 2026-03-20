import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { RepoInputSchema } from "@/lib/schemas/github";

export interface RepoCoordinates {
  owner: string;
  repo: string;
}

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

export function formatNumber(value: number): string {
  return new Intl.NumberFormat("en", {
    notation: value >= 10_000 ? "compact" : "standard",
    maximumFractionDigits: 1,
  }).format(value);
}

export function formatBytes(value: number): string {
  if (value < 1024) {
    return `${value} B`;
  }

  const units = ["KB", "MB", "GB", "TB"] as const;
  let current = value / 1024;
  let unitIndex = 0;

  while (current >= 1024 && unitIndex < units.length - 1) {
    current /= 1024;
    unitIndex += 1;
  }

  return `${current.toFixed(current >= 10 ? 0 : 1)} ${units[unitIndex]}`;
}

export function formatDate(value: string): string {
  const normalized = /^\d{4}-\d{2}-\d{2}$/.test(value) ? `${value}T12:00:00Z` : value;
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(normalized));
}

export function formatRelativeDate(value: string): string {
  const date = new Date(value);
  const diff = date.getTime() - Date.now();
  const rtf = new Intl.RelativeTimeFormat("en", { numeric: "auto" });
  const absDiff = Math.abs(diff);
  const thresholds: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ["year", 1000 * 60 * 60 * 24 * 365],
    ["month", 1000 * 60 * 60 * 24 * 30],
    ["day", 1000 * 60 * 60 * 24],
    ["hour", 1000 * 60 * 60],
    ["minute", 1000 * 60],
    ["second", 1000],
  ];

  for (const [unit, unitSize] of thresholds) {
    if (absDiff >= unitSize || unit === "second") {
      return rtf.format(Math.round(diff / unitSize), unit);
    }
  }

  return rtf.format(0, "second");
}

export function parseRepoInput(value: string): RepoCoordinates {
  const normalized = value.trim().replace(/\/+$/, "");
  const shorthand = normalized.replace(/^https?:\/\/(?:www\.)?github\.com\//i, "").replace(/^github\.com\//i, "");
  const candidate = RepoInputSchema.parse(shorthand.includes("/") ? shorthand : normalized);
  const path = candidate
    .replace(/^https?:\/\/(?:www\.)?github\.com\//i, "")
    .replace(/^github\.com\//i, "")
    .replace(/\.git$/i, "");
  const [owner, repo, ...rest] = path.split("/").filter(Boolean);

  if (!owner || !repo || rest.length > 0) {
    throw new Error("Enter a GitHub repository in the form owner/repo or https://github.com/owner/repo");
  }

  return { owner, repo };
}
