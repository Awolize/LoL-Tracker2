"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function Profile() {
	const pathname = usePathname();

	const [_, server, username, path] = pathname.split("/");

	return (
		<div className="flex h-full w-full flex-row items-center justify-center px-4 align-middle">
			<Link href={`/${server}/${username}`} className="rounded p-1 hover:bg-gray-600">
				{username?.replace("-", "#")} ({server})
			</Link>
		</div>
	);
}
