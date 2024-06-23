"use server";

import Image from "next/image";
import Link from "next/link";

export default async function Client({ region, username: rawUsername, profileIconId, summonerLevel, patch }) {
	const username = rawUsername.replace("-", "#");
	const DATA_DRAGON_URL_SHORT = "https://ddragon.leagueoflegends.com/cdn";
	const DATA_DRAGON_PROFILE_ICON = "img/profileicon";
	const profileIconUrl = `${DATA_DRAGON_URL_SHORT}/${patch}/${DATA_DRAGON_PROFILE_ICON}/${profileIconId}.png`;

	return (
		<div>
			<div className="flex h-screen w-screen justify-center">
				<ul className="flex flex-col text-xl">
					<div className="h-5" />
					<div className="relative flex flex-row items-center justify-center gap-6">
						<div className="absolute left-0">
							<Image
								src={profileIconUrl}
								alt={`${profileIconId}`}
								height={90}
								width={90}
								// hidden={hideAll}
								// placeholder="/placeholder.png"
							/>
						</div>
						<div className="flex-col items-center bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 bg-clip-text text-transparent">
							<div className="text-6xl">{username}</div>
							<div className="flex flex-row items-center justify-between ">
								<div className="font-bold text-sm ">{region}</div>
								<div className="font-bold text-sm ">{summonerLevel}</div>
							</div>
						</div>
					</div>
					<div className="h-10" />
					<div className="flex flex-col items-center">
						<div className="flex flex-col gap-6 ">
							<div>
								<Link href={`${rawUsername}/mastery`} className="underline">
									Mastery Points Tracker
								</Link>
								<div className="text-sm">
									Tailored for the challenge{" "}
									<span className="font-bold italic">Catch &apos;em all</span>, but also works with{" "}
									<span className="font-bold italic">Master yourself</span> and{" "}
									<span className="font-bold italic">Master your enemy</span>
								</div>
							</div>
							<div>
								<Link href={`${rawUsername}/different`} className="underline">
									Champion Tracker
								</Link>
								<div className="text-sm">
									Manually keep track of specific heroes. For challenges such as{" "}
									<span className="font-bold italic">All Random All Champions</span>, with{" "}
									<span className="font-bold italic">Jack of All Champs</span>, and{" "}
									<span className="font-bold italic">Protean Override</span>
									<br />
									More trackers can be added. If you have a specific one in mind that you believe is
									simple to add just create a new issue on Github
								</div>
							</div>
						</div>
					</div>
				</ul>
				{/* <div className="flex flex-grow"></div>
                <footer>
                    Github link
                </footer> */}
			</div>
		</div>
	);
}
