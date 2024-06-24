import type { Metadata } from "next";
import Profile from "./header/Profile";
import MainIcon from "./header/MainIcon";
import Search from "./header/Search";

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
			<header className="sticky top-0 z-30 flex w-screen flex-row justify-between bg-primary-foreground">
				<div className="w-1/3">
					<MainIcon />
				</div>
				<div className="w-1/3">
					<Profile />
				</div>
				<div className="w-1/3">
					<Search />
				</div>
			</header>

			{children}

			<footer className="flex flex-col items-center p-2 text-sm opacity-50">
				'lol.awot.dev' isn't endorsed by Riot Games and doesn't reflect the views or opinions of Riot Games or
				anyone officially involved in producing or managing Riot Games properties. Riot Games, and all
				associated properties are trademarks or registered trademarks of Riot Games, Inc.
			</footer>
		</div>
	);
}
