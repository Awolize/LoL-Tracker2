"use client";

import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import { ArrowRightEndOnRectangleIcon as SubmitIcon } from "@heroicons/react/24/outline";

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
			<main
				className={`flex min-h-screen flex-col items-center justify-center bg-[url('/background-1.webp')] bg-center bg-cover`}
			>
				{/* <div className="flex h-full w-full flex-col items-center justify-center gap-4 px-4 py-2"> */}
				<div className="flex w-full animate-pulse2 flex-col items-center justify-center gap-4 bg-black py-16">
					<div>
						<h1 className="text-center font-extrabold text-2xl text-foreground tracking-tight sm:text-[2rem] ">
							Awot's Challenges Tracker
						</h1>
						<h6 className="text-center text-foreground text-xl tracking-tight">League of Legends</h6>
					</div>
					<div>
						<div className="flex h-full w-full flex-row items-center justify-center gap-4 px-4 py-2">
							<h1 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-[2rem] ">
								<div className="inline-block">
									<RegionListSelector
										selectedRegion={selectedRegion}
										setSelectedRegion={setSelectedRegion}
									/>
								</div>
							</h1>
							<form id="search-summoner" className="flex flex-row gap-[0.125rem]" onSubmit={onSubmit}>
								<div>
									<div className="flex flex-col gap-1">
										<input
											type="text"
											ref={usernameRef}
											placeholder="lol.awot#dev"
											className="h-12 w-full rounded-l bg-gray-700 text-center text-xl placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
										/>
										<div className="text-foreground/50 text-xs">
											Remember to include the # and tagline like: Awot#dev
										</div>
									</div>
								</div>
								<button
									form="search-summoner"
									type="submit"
									className="h-12 w-8 rounded-r bg-gray-700 p-1 align-middle hover:bg-gray-600"
								>
									{loading ? <LoadingComponent /> : <SubmitIcon />}
								</button>
							</form>
						</div>
					</div>
				</div>
			</main>
		</>
	);
}
