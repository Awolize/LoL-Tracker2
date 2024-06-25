import Image from "next/image";
import githubColor from "./github-color.svg";
import github from "./github.svg";
import leagueColor from "./leagueoflegends-color.svg";
import league from "./leagueoflegends.svg";
import riotColor from "./riotgames-color.svg";
import riot from "./riotgames.svg";

export default function FooterLinks() {
	return (
		<div className="flex flex-row gap-4">
			<a href="https://github.com/Awolize/LoL-Tracker2">
				<Image alt="riotIconColor" src={githubColor} />
			</a>
			<a href="https://www.leagueoflegends.com/en-gb/">
				<Image alt="leagueIconColor" src={leagueColor} />
			</a>
			<a href="https://www.riotgames.com/en">
				<Image alt="riotIconColor" src={riotColor} />
			</a>
		</div>
	);
}
