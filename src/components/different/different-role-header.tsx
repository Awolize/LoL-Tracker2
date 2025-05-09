export const DifferentRoleHeader = ({ role }: { role: string }) => {
	return (
		<div className="flex flex-row justify-center gap-8 align-bottom text-md">
			<div className="mb-2 bg-linear-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
				<div className="flex h-full flex-col justify-between bg-background text-gray-200">
					<h4 className="font-bold text-xl">{role}</h4>
				</div>
			</div>
		</div>
	);
};
