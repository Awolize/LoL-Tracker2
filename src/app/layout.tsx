// import "public/build.css";
import "~/styles/globals.css";

import type { Metadata } from "next";
import { ThemeProvider } from "~/components/theme-provider";
import { TRPCReactProvider } from "~/trpc/react";

export const metadata: Metadata = {
	applicationName: "LoL Mastery Tracker",
	title: "LoL Mastery Tracker, brought to you by me!",
	description: "Made using Riot API. Repo can be found using https://github.com/Awolize.",
	icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default async function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<html lang="en">
			<body>
				<TRPCReactProvider>
					<ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
						{children}
					</ThemeProvider>
				</TRPCReactProvider>
			</body>
		</html>
	);
}
