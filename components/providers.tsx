"use client";

import { type ReactNode } from "react";
import { SessionProvider } from "next-auth/react";
import { ThemeProvider } from "next-themes";
import { AnimatePresence, motion } from "framer-motion";
import { usePathname } from "next/navigation";
import { FloatingNavbar } from "@/components/ui/FloatingNavbar";
import { AuthControl } from "@/components/ui/AuthControl";
import type { Session } from "next-auth";

interface ProvidersProps {
	children: ReactNode;
	session: Session | null;
}

export function Providers({ children, session }: ProvidersProps): ReactNode {
	const pathname = usePathname();

	return (
		<SessionProvider session={session}>
			<ThemeProvider attribute="class" defaultTheme="system" enableSystem>
				<AnimatePresence mode="wait">
					<motion.div
						key={pathname}
						initial={{ opacity: 0, y: 16 }}
						animate={{ opacity: 1, y: 0 }}
						exit={{ opacity: 0, y: -12 }}
						transition={{ duration: 0.35, ease: "easeOut" }}
						className="relative min-h-screen pb-32">
						{children}
					</motion.div>
				</AnimatePresence>
				<FloatingNavbar />
				<AuthControl />
			</ThemeProvider>
		</SessionProvider>
	);
}
