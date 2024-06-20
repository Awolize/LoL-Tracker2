export const DifferentHeader = ({ finished, total, patch }) => {
	return (
		<header className="relative mt-2 flex w-full justify-center">
			<div className="w-52 min-w-fit">
				<div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
					<div className="flex h-full flex-col justify-between rounded-lg bg-background px-4 py-2 text-center text-foreground ">
						<p className="text-2xl">
							{finished} / {total}
						</p>
						<p className="text-sm">{((100 * finished) / total).toFixed(2)} %</p>
					</div>
				</div>
			</div>

			<div className="fixed top-1 right-3">
				<span className="text-gray-400">V{patch}</span>
			</div>
		</header>
	);
};
