import type { Metadata } from "next";
import FooterLinks from "~/components/footer/FooterLinks";
import RiotGamesDisclaimer from "~/components/footer/RiotGamesDisclaimer";
import MainIcon from "~/components/header/MainIcon";
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

			<footer className="flex flex-col items-center p-2 gap-4 text-sm opacity-50">
				<FooterLinks />
				<RiotGamesDisclaimer />
			</footer>
		</div>
	);
}
