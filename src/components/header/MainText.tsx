import clsx from "clsx";

type TailwindFontWeight =
	| "thin"
	| "extralight"
	| "light"
	| "normal"
	| "medium"
	| "semibold"
	| "bold"
	| "extrabold"
	| "black";

export const MainText = ({ bold = "extrabold", lg = true }: { bold?: TailwindFontWeight; lg?: boolean }) => {
	return (
		<h1
			className={clsx(`text-center ${`font-${bold}`} text-foreground tracking-tight `, {
				"text-[2rem]": lg,
				"text-[1.5rem]": !lg,
			})}
		>
			Awot's Challenge Tracker
		</h1>
	);
};
