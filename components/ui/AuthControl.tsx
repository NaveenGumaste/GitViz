"use client";

import { useMemo } from "react";
import { CircleUserRound, LogOut, LogIn } from "lucide-react";
import { signIn, signOut, useSession } from "next-auth/react";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

function getInitials(name?: string | null): string {
	if (!name) {
		return "U";
	}

	return name
		.trim()
		.split(/\s+/)
		.slice(0, 2)
		.map((part) => part[0]?.toUpperCase() ?? "")
		.join("")
		.slice(0, 2);
}

export function AuthControl(): React.ReactNode {
	const { data: session, status } = useSession();

	const userLabel = useMemo(
		() =>
			session?.user.name?.trim() ||
			session?.user.email?.split("@")[0] ||
			"Profile",
		[session?.user.email, session?.user.name],
	);
	const initials = useMemo(
		() => getInitials(session?.user.name ?? session?.user.email),
		[session?.user.email, session?.user.name],
	);

	const handleSignIn = async (): Promise<void> => {
		await signIn("github", { callbackUrl: window.location.href });
	};

	const handleSignOut = async (): Promise<void> => {
		await signOut({ callbackUrl: "/" });
	};

	return (
		<div className="fixed right-4 top-4 z-120 sm:right-6 sm:top-6">
			{status === "authenticated" && session ? (
				<div className="group relative">
					<Button
						type="button"
						variant="nav"
						size="sm"
						className="gap-3 border border-border/80 bg-paper/90 px-3 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl hover:translate-y-0 dark:border-border-dark/80 dark:bg-surface/90 dark:text-paper dark:shadow-[0_8px_24px_rgba(0,0,0,0.32)]"
						iconLeft={
							<span
								className="flex size-7 items-center justify-center overflow-hidden rounded-full bg-accent text-xs font-semibold text-paper ring-1 ring-border/70 dark:ring-border-dark/70"
								aria-hidden="true">
								{session.user.image ? (
									<span
										className="block size-full bg-cover bg-center"
										style={{ backgroundImage: `url(${session.user.image})` }}
									/>
								) : (
									initials
								)}
							</span>
						}>
						<span className="hidden max-w-28 truncate sm:inline">
							{userLabel}
						</span>
						<CircleUserRound className="size-4 sm:hidden" aria-hidden="true" />
					</Button>

					<div
						className={cn(
							"absolute right-0 top-full mt-3 w-44 rounded-2xl border border-border/80 bg-paper/95 p-2 shadow-[0_16px_40px_rgba(0,0,0,0.14)] backdrop-blur-xl transition-all duration-150 dark:border-border-dark/80 dark:bg-surface/95 dark:shadow-[0_16px_40px_rgba(0,0,0,0.36)]",
							"pointer-events-none translate-y-2 opacity-0 group-hover:pointer-events-auto group-hover:translate-y-0 group-hover:opacity-100 group-focus-within:pointer-events-auto group-focus-within:translate-y-0 group-focus-within:opacity-100",
						)}>
						<button
							type="button"
							onClick={handleSignOut}
							className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-medium text-ink transition-colors hover:bg-accent-muted dark:text-paper dark:hover:bg-accent-muted">
							<LogOut className="size-4" aria-hidden="true" />
							Sign out
						</button>
					</div>
				</div>
			) : (
				<Button
					type="button"
					variant="nav"
					size="sm"
					onClick={handleSignIn}
					loading={status === "loading"}
					iconLeft={<LogIn className="size-4" aria-hidden="true" />}
					className="border border-border/80 bg-paper/90 px-4 text-ink shadow-[0_8px_24px_rgba(0,0,0,0.10)] backdrop-blur-xl hover:translate-y-0 dark:border-border-dark/80 dark:bg-surface/90 dark:text-paper dark:shadow-[0_8px_24px_rgba(0,0,0,0.32)]">
					Sign in
				</Button>
			)}
		</div>
	);
}
