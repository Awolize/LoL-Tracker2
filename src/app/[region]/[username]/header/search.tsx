"use client";

import { ArrowRightEndOnRectangleIcon as SubmitIcon } from "@heroicons/react/24/outline";
import { useRouter } from "next/navigation";
import { useRef, useState } from "react";
import LoadingComponent from "~/components/old/loading-spinner";
import RegionListSelector, { regions } from "~/components/old/region-list-selector";

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
		<div className="flex flex-row items-center gap-4 px-4 py-2">
			<h1 className="font-extrabold text-2xl text-foreground tracking-tight sm:text-[2rem] ">
				<div className="inline-block">
					<RegionListSelector selectedRegion={selectedRegion} setSelectedRegion={setSelectedRegion} />
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
	);
}
