import Link from "next/link";
import { MainText } from "./MainText";

export default function MainIcon() {
	return (
		<div className="flex h-full w-full items-center justify-center">
			<Link href={"/"} className=" rounded p-2 hover:bg-gray-600">
				<MainText bold={"medium"} lg={false} />
			</Link>
		</div>
	);
}
