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
			className={`text-center ${`font-${bold}`} ${lg ? "text-[2rem]" : "text-[1.5rem]"} text-foreground tracking-tight `}
		>
			Awot's Challenges Tracker
		</h1>
	);
};
