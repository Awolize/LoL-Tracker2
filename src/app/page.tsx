"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";

import LoadingComponent from "../components/old/loading-spinner";
import RegionListSelector, { regions } from "../components/old/region-list-selector";

export default function Page() {
	const router = useRouter();
	const usernameRef = useRef<HTMLInputElement>(null);
	const [loading, setLoading] = useState(false);
	const [selectedRegion, setSelectedRegion] = useState(regions[0]);

	function onSubmit(e: React.FormEvent) {
		e.preventDefault();
		console.log(
			`Redirecting to "/${selectedRegion?.name}/${usernameRef.current?.value
				.replace("#", "-")
				.toLowerCase()}..."`,
		);
		router.push(`/${selectedRegion?.name}/${usernameRef.current?.value.replace("#", "-").toLowerCase()}`);
		setLoading(true);
	}

	return (
		<>
			{/* <Head>
                <title>LoL Mastery Tracker</title>
                <meta property="og:title" content="LoL Mastery Tracker, brought to you by me!" key="title" />
                <meta
                    property="og:description"
                    content="Made using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
                />
                <meta property="og:image" content="https://lol.awot.dev/favicon.ico" />
                <link rel="icon" href="/favicon.ico" />
            </Head> */}
			<main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
				<div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
					<h1 className="text-2xl font-extrabold tracking-tight text-foreground sm:text-[2rem] ">
						Search{" "}
						<div className="inline-block">
							<RegionListSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
						</div>{" "}
						Summoner Profile
					</h1>
					<form className="grid grid-rows-1 gap-4 sm:grid-rows-2 md:gap-8" onSubmit={onSubmit}>
						<div className={"flex flex-col gap-1"}>
							<input
								type="text"
								ref={usernameRef}
								placeholder="lol.awot#dev"
								className="w-full h-12 rounded bg-gray-700 text-center text-xl placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
							/>
							<div className="text-foreground/50 text-xs">
								Remember to include the # and tagline like: Awot#dev
							</div>
						</div>
						<button
							type="submit"
							className="flex items-center justify-center gap-4 rounded-xl bg-white/10 p-4 text-foreground hover:bg-white/20"
						>
							{loading ? (
								<LoadingComponent />
							) : (
								<h3 className="justify-center text-center font-bold">Look up</h3>
							)}
						</button>
					</form>
				</div>
			</main>
		</>
	);
}
