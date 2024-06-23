import type { Metadata } from "next";
import SearchBar from "./header/search";

export async function generateMetadata({ params: { region, username } }): Promise<Metadata> {
	return {
		applicationName: "LoL Mastery Tracker",
		title: `LoL Mastery Tracker. ${username} Profile`,
		description:
			"Made using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/",
		keywords: [region, username, "LoL", "mastery", "tracker"],
	};
}

export default function RootLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	return (
		<div className="flex flex-col">
			<header className="flex flex-col sticky w-screen items-end border-b-4 bg-background z-30 top-0">
				<SearchBar />
			</header>

			{children}

			<footer className="flex flex-col items-center text-sm opacity-50 p-2">
				'lol.awot.dev' isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or
				anyone officially involved in producing or managing Riot Games properties. Riot Games, and all
				associated properties are trademarks or registered trademarks of Riot Games, Inc.
			</footer>
		</div>
	);
}
