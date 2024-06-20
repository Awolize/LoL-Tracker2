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
						: "bg-gradient-to-r from-purple-500 to-indigo-500 w-16"
				} relative inline-flex my-2 py-1 px-3 items-center justify-center rounded`}
			>
				<div className="flex flex-row gap-2 ">{checked ? <LoadingComponent /> : label}</div>
			</button>
		</div>
	);
};
