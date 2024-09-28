import React from "react";

interface RoleHeaderProps {
	role: string;
	finishedSize: number;
	size: number;
	hasHidden: boolean;
	percentage: number;
}

export function RoleHeader({ role, finishedSize, size, hasHidden, percentage }: RoleHeaderProps) {
	return (
		<div className="flex flex-row justify-evenly align-bottom text-md">
			<h4 className="my-auto p-2">
				{finishedSize} / {size}
				{hasHidden ? "*" : ""}
			</h4>
			<div className="mb-2 bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
				<div className="flex h-full flex-col justify-between bg-background text-foreground">
					<h4 className="font-bold text-xl">{role}</h4>
				</div>
			</div>
			<h4 className="my-auto p-2">{percentage.toFixed(1)} %</h4>
		</div>
	);
}
