import { useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import type { Prisma } from "@prisma/client";

import { api } from "../utils/api";

export const DifferentSideBar = ({ server, username, selectedItem, setSelectedItem }) => {
    const [drawerOpen, setDrawerOpen] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const handleItemClick = (itemId) => {
        setSelectedItem(itemId);
    };

    const refreshQuery = api.differentApi.updateChallengeConfig.useQuery({ server, username }, { enabled: false });
    const { data: challenges } = api.differentApi.getChallenges.useQuery({ server, username });

    // Filter challenges based on search term
    const filteredChallenges = challenges?.data.filter((item) => {
        const local1: any = item?.localizedNames;
        const local: { en_US: { name: string; description: string } } = local1;
        return (
            local.en_US.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            local.en_US.description.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const keystoneChallenges = challenges?.keystones;

    const LastItem = ({ selected, small }) => {
        const handleClick = () => {
            refreshQuery.refetch();
        };

        const itemClasses = `${small ? "px-2" : "px-4"} duration-300 py-2 cursor-pointer ${
            selected ? "bg-gray-800" : ""
        }`;
        return (
            <div className={itemClasses} onClick={handleClick}>
                {"Update db"}
            </div>
        );
    };

    return (
        <div className="h-screen ">
            <nav
                className={`bg-slate-900 h-4/5 py-8 ${
                    drawerOpen ? "pl-5 pr-8 w-72" : "px-2 w-20"
                } duration-300 relative rounded-r-lg`}
            >
                {drawerOpen ? (
                    <ArrowLeftIcon
                        className="bg-slate-900 text-white w-8 rounded-full absolute -right-4 top-9 p-1 border border-black cursor-pointer"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    />
                ) : (
                    <ArrowRightIcon
                        className="bg-slate-900 text-white w-8 rounded-full absolute -right-4 top-9 p-1 border border-black cursor-pointer"
                        onClick={() => setDrawerOpen(!drawerOpen)}
                    />
                )}

                <div className="flex flex-col h-full">
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 rounded px-2 py-1 mt-4 mb-2"
                    />

                    <ul className="flex flex-col gap-1 overflow-y-auto">
                        {filteredChallenges?.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                selected={selectedItem === item.id}
                                onItemClick={handleItemClick}
                                small={!drawerOpen}
                            />
                        ))}
                    </ul>
                    <LastItem selected small={!drawerOpen} />
                </div>
            </nav>
        </div>
    );
};

const Item = ({
    item,
    selected,
    onItemClick,
    small,
}: {
    item: {
        id: number;
        localizedNames: Prisma.JsonValue;
    };
    selected: boolean;
    onItemClick: (itemId: number) => void;
    small: boolean;
}) => {
    const handleClick = () => {
        onItemClick(item.id);
    };

    const local1: any = item?.localizedNames;
    const local: { en_US: { name: string; description: string } } = local1;

    const text = local.en_US.name;
    const description = local.en_US.description;

    const itemClasses = `${small ? "px-2" : "px-4"} duration-300 py-2 cursor-pointer ${selected ? "bg-gray-800" : ""}`;
    return (
        <li className={itemClasses} onClick={handleClick}>
            <p className="text-sm">{text}</p>
            <p className="text-xs opacity-50">{description}</p>
        </li>
    );
};
