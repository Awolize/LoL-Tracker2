import Link from "next/link";

export default function MainIcon() {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<Link href={"/"} className=" rounded p-2 hover:bg-gray-600">
				lol.awot.dev
			</Link>
		</div>
	);
}
