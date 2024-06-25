import type { Metadata } from "next";
import FooterLinks from "~/components/footer/FooterLinks";
import RiotGamesDisclaimer from "~/components/footer/RiotGamesDisclaimer";
import { MainTitleLink } from "~/components/header/MainTitleLink";
import Profile from "~/components/header/Profile";
import Search from "~/components/header/Search";

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
			<header className="sticky top-0 z-30 flex w-screen flex-col justify-between bg-primary-foreground px-1 md:flex-row md:px-8">
				<div className="flex flex-1">
					<MainTitleLink />
				</div>
				<div>
					<Profile />
				</div>
				<div className="flex flex-1">
					<Search />
				</div>
			</header>

			{children}

			<footer className="flex flex-col items-center gap-4 p-2 text-sm opacity-50">
				<FooterLinks />
				<RiotGamesDisclaimer />
			</footer>
		</div>
	);
}
