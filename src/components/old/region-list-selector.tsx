import { Listbox, ListboxButton, ListboxOption, ListboxOptions } from "@headlessui/react";

export const regions = [
	{ id: 3, name: "EUW", disabled: false },
	{ id: 1, name: "BR", disabled: false },
	{ id: 2, name: "EUNE", disabled: false },
	{ id: 4, name: "KR", disabled: false },
	{ id: 5, name: "LA1", disabled: false },
	{ id: 6, name: "LA2", disabled: false },
	{ id: 7, name: "NA", disabled: false },
	{ id: 8, name: "OC", disabled: false },
	{ id: 9, name: "TR", disabled: false },
	{ id: 10, name: "RU", disabled: false },
	{ id: 11, name: "JP", disabled: false },
	{ id: 12, name: "PBE", disabled: false },
];

export const RegionListSelector = ({ selectedRegion, setSelectedRegion }) => {
	return (
		<Listbox value={selectedRegion} onChange={setSelectedRegion}>
			<ListboxButton className={"flex items-end"}>
				<span className="text-[hsl(280,100%,70%)]">{selectedRegion?.name}</span>
				<p className="text-xs">v</p>
			</ListboxButton>
			<div className="relative">
				<ListboxOptions className="absolute top-0 left-0 inline w-[150px] flex-col">
					{regions
						.filter((region) => selectedRegion?.id !== region.id)
						.map((region) => (
							<ListboxOption key={region.id} value={region} disabled={region.disabled}>
								<button
									type="button"
									className="w-full text-left hover:bg-gray-500 hover:bg-opacity-20 hover:text-[hsl(280,100%,70%)]"
								>
									{region.name}
								</button>
							</ListboxOption>
						))}
				</ListboxOptions>
			</div>
		</Listbox>
	);
};

export default RegionListSelector;
