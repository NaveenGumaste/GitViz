import type { Metadata } from "next";
import { Inter, JetBrains_Mono, Playfair_Display } from "next/font/google";
import { auth } from "@/auth";
import { Providers } from "@/components/providers";
import "./globals.css";

const display = Playfair_Display({
	subsets: ["latin"],
	variable: "--font-display-face",
	display: "swap",
});

const body = Inter({
	subsets: ["latin"],
	variable: "--font-body-face",
	display: "swap",
});

const mono = JetBrains_Mono({
	subsets: ["latin"],
	variable: "--font-mono-face",
	display: "swap",
});

export const metadata: Metadata = {
	title: {
		default: "GitViz",
		template: "%s · GitViz",
	},
	description:
		"Visualize GitHub repositories with editorial-style charts, a radial file tree, a commit heatmap, contributor stats, and language breakdowns.",
};

export default async function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>): Promise<React.ReactNode> {
	const session = await auth();

	return (
		<html
			lang="en"
			suppressHydrationWarning
			className={`${display.variable} ${body.variable} ${mono.variable} scroll-smooth`}>
			<body
				suppressHydrationWarning
				className="bg-paper text-ink antialiased transition-colors dark:bg-ink dark:text-paper">
				<Providers session={session}>{children}</Providers>
			</body>
		</html>
	);
}
