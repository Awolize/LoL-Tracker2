import { useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { FunnelIcon as OutlineFunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as SolidFunnelIcon } from "@heroicons/react/24/solid";
import type { ChallengeLocalization } from "@prisma/client";

import { api, processingApi } from "../utils/api";

export const DifferentSideBar = ({ server, username, selectedItem, setSelectedItem, mappedCases }) => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleItemClick = (itemId) => {
        if (selectedItem !== itemId) {
            setSelectedItem(itemId);
        } else {
            setSelectedItem(null);
        }
    };
    const utils = api.useContext();

    const refreshQuery = processingApi.processingApi.updateChallengeConfig.useMutation();
    const refreshQuery2 = processingApi.processingApi.updateGames.useMutation();
    const refreshQuery3 = processingApi.processingApi.updateJackOfAllChamps.useMutation({
        onSettled: () => {
            utils.differentApi.getChallengesConfig.invalidate();
        },
    });

    const { data: challenges, status } = api.differentApi.getChallengesConfig.useQuery({ server, username });

    // Filter challenges based on search term and mappedCases
    const filteredChallenges = challenges?.data.filter((item) => {
        const local = item?.localizedNames;
        const enUSName = local.find((name) => name.language === "en_US")?.name;
        const enUSDescription = local.find((name) => name.language === "en_US")?.description;

        const nameMatch = enUSName?.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = enUSDescription?.toLowerCase().includes(searchTerm.toLowerCase());

        return nameMatch || descriptionMatch;
    });

    const keystoneChallenges = challenges?.keystones;

    const LastItem = ({ selected }) => {
        const handleClick = () => {
            refreshQuery.mutate({ server, username });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button className={itemClasses} onClick={handleClick}>
                Update db
            </button>
        );
    };
    const LastItem2 = ({ selected }) => {
        const handleClick = () => {
            refreshQuery2.mutate({ server, username, count: 1000 });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button className={itemClasses} onClick={handleClick}>
                Update games
            </button>
        );
    };
    const LastItem3 = ({ selected }) => {
        const handleClick = () => {
            refreshQuery3.mutate({ server, username });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button className={itemClasses} onClick={handleClick}>
                Update jack of all champs
            </button>
        );
    };

    return (
        <nav
            className={`bg-slate-900 h-full py-4 ${
                drawerOpen ? "pl-2 pr-2 w-72" : "px-2 w-0"
            } duration-300 relative rounded-r-lg`}
        >
            {drawerOpen ? (
                <ArrowLeftIcon
                    className="bg-slate-900 text-white w-8 rounded-full absolute -right-4 top-[52px] p-1 border border-black cursor-pointer"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                />
            ) : (
                <ArrowRightIcon
                    className="bg-slate-900 text-white w-8 rounded-full absolute -right-4 top-[52px] p-1 border border-black cursor-pointer"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                />
            )}

            {drawerOpen && (
                <div className="flex flex-col h-full gap-1">
                    <p className="text-center border-b border-gray-600 ">Challenges</p>
                    <div className="inline-flex justify-evenly">
                        <input
                            type="text"
                            placeholder="Search..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="bg-gray-800 rounded px-2 py-1 my-1"
                        />
                        {showAll ? (
                            <OutlineFunnelIcon
                                onClick={() => setShowAll(!showAll)}
                                className="text-gray-500 bg-gray-800 rounded h-8 px-2 py-1 my-1"
                                aria-checked={showAll}
                            />
                        ) : (
                            <SolidFunnelIcon
                                onClick={() => setShowAll(!showAll)}
                                className="text-gray-500 bg-gray-800 rounded h-8 px-2 py-1 my-1"
                                aria-checked={showAll}
                            />
                        )}
                    </div>
                    <ul className="flex flex-col gap-1 overflow-y-auto">
                        {filteredChallenges?.map((item) => {
                            const implemented = mappedCases.includes(item.id);

                            if (!showAll && !implemented) {
                                return <></>;
                            }

                            return (
                                <Item
                                    key={item.id}
                                    item={item}
                                    selected={selectedItem === item.id}
                                    onItemClick={handleItemClick}
                                    implemented={implemented}
                                />
                            );
                        })}
                    </ul>
                    <LastItem selected />
                    <LastItem2 selected />
                    <LastItem3 selected />
                </div>
            )}
        </nav>
    );
};

const Item = ({
    item,
    selected,
    onItemClick,
    implemented,
}: {
    item: {
        id: number;
        localizedNames: ChallengeLocalization[];
    };
    selected: boolean;
    onItemClick: (itemId: number) => void;
    implemented: boolean;
}) => {
    const handleClick = () => {
        onItemClick(item.id);
    };

    const localized = item.localizedNames.find((el) => el.language === "en_US");

    if (!localized) return <></>;

    const text = localized.name;
    const description = localized.description;

    return (
        <li
            className={`relative duration-300 py-2 cursor-pointer rounded-sm ${selected ? "bg-gray-800" : ""}`}
            onClick={handleClick}
        >
            <div className="flex px-2 gap-x-2 ">
                <span className="w-3 text-green-500">{implemented && "●"}</span>
                <div className="w-full ">
                    <p className="text-sm">{text}</p>
                    <p className="text-xs opacity-50">{description}</p>
                </div>
            </div>
        </li>
    );
};
