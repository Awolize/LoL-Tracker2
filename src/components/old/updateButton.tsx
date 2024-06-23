import LoadingComponent from "./loading-spinner";

export const UpdateButton = ({ label, checked, onChange }) => {
	return (
		<div className="flex flex-row items-center gap-2">
			<button
				type="button"
				onClick={!checked ? onChange : undefined}
				className={`${
					!checked
						? "bg-gradient-to-r from-indigo-500 to-purple-500"
						: "w-16 bg-gradient-to-r from-purple-500 to-indigo-500"
				} relative my-2 inline-flex items-center justify-center rounded px-3 py-1`}
			>
				<div className="flex flex-row gap-2 ">{checked ? <LoadingComponent /> : label}</div>
			</button>
		</div>
	);
};
