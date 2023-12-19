import { Listbox } from "@headlessui/react";

export const servers = [
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

export const ServerListSelector = ({ selectedServer, setSelectedServer }) => {
    return (
        <Listbox value={selectedServer} onChange={setSelectedServer}>
            <Listbox.Button className={"flex items-end"}>
                <span className="text-[hsl(280,100%,70%)]">{selectedServer?.name}</span>
                <p className="text-xs">v</p>
            </Listbox.Button>
            <div className="relative">
                <Listbox.Options className="absolute top-0 left-0 flex-col inline w-[150px]">
                    {servers
                        .filter((server) => selectedServer?.id !== server.id)
                        .map((server) => (
                            <Listbox.Option key={server.id} value={server} disabled={server.disabled}>
                                <button
                                    type="button"
                                    className="hover:text-[hsl(280,100%,70%)] hover:bg-opacity-20 hover:bg-gray-500 w-full text-left"
                                >
                                    {server.name}
                                </button>
                            </Listbox.Option>
                        ))}
                </Listbox.Options>
            </div>
        </Listbox>
    );
};

export default ServerListSelector;
