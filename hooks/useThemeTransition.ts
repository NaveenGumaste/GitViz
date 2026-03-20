import { useCallback, useEffect, useRef } from "react";

export function useThemeTransition(): (nextTheme: "light" | "dark" | "system", setTheme: (theme: "light" | "dark" | "system") => void) => void {
  const timeoutRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (timeoutRef.current !== null) {
        window.clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback((nextTheme, setTheme) => {
    document.documentElement.classList.add("transitioning");
    setTheme(nextTheme);

    if (timeoutRef.current !== null) {
      window.clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = window.setTimeout(() => {
      document.documentElement.classList.remove("transitioning");
      timeoutRef.current = null;
    }, 450);
  }, []);
}
