"use client";

import { type Dispatch, type SetStateAction, useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import { FunnelIcon as OutlineFunnelIcon } from "@heroicons/react/24/outline";
import { FunnelIcon as SolidFunnelIcon } from "@heroicons/react/24/solid";
import type { ChallengeLocalization, Summoner } from "@prisma/client";
import type { Regions } from "twisted/dist/constants";
import { api } from "~/trpc/react";

export const DifferentSideBar = ({
    region,
    user,
    selectedItem,
    setSelectedItem,
    mappedCases,
}: {
    region: Regions;
    user: Summoner;
    selectedItem: number;
    setSelectedItem: Dispatch<SetStateAction<number>>;
    mappedCases: number[];
}) => {
    const [drawerOpen, setDrawerOpen] = useState(true);
    const [showAll, setShowAll] = useState(false);
    const [searchTerm, setSearchTerm] = useState("");

    const handleItemClick = (itemId) => {
        if (selectedItem !== itemId) {
            setSelectedItem(itemId);
        } else {
            setSelectedItem(0);
        }
    };
    const utils = api.useUtils();

    const refreshQueryUpdateChallengeConfig = api.processingApi.updateChallengeConfig.useMutation();
    const refreshQueryUpdateGames = api.processingApi.updateGames.useMutation();
    const refreshQueryUpdateJackOfAllChamps = api.processingApi.updateJackOfAllChamps.useMutation({
        onSuccess: async () => {
            await utils.differentApi.getChallengesConfig.invalidate();
        },
    });

    const { data: challenges } = api.differentApi.getChallengesConfig.useQuery({
        username: `${user.gameName}#${user.tagLine}`,
        region,
    });

    // Filter challenges based on search term and mappedCases
    const filteredChallenges = challenges?.data.filter((item) => {
        const local = item?.localizedNames;
        const enUSName = local.find((name) => name.language === "en_US")?.name;
        const enUSDescription = local.find((name) => name.language === "en_US")?.description;

        const nameMatch = enUSName?.toLowerCase().includes(searchTerm.toLowerCase());
        const descriptionMatch = enUSDescription?.toLowerCase().includes(searchTerm.toLowerCase());

        return nameMatch ?? descriptionMatch;
    });

    // const keystoneChallenges = challenges?.keystones;

    const LastItem = ({ selected }) => {
        const handleClick = () => {
            refreshQueryUpdateChallengeConfig.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button type="button" className={itemClasses} onClick={handleClick}>
                Update db
            </button>
        );
    };
    const LastItem2 = ({ selected }) => {
        const handleClick = () => {
            refreshQueryUpdateGames.mutate({ gameName: `${user.gameName}`, tagLine: `${user.tagLine}`, region });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button type="button" className={itemClasses} onClick={handleClick}>
                Update games
            </button>
        );
    };
    const LastItem3 = ({ selected }) => {
        const handleClick = () => {
            refreshQueryUpdateJackOfAllChamps.mutate({ region, username: `${user.gameName}#${user.tagLine}` });
        };

        const itemClasses = `px-4 duration-300 py-2 cursor-pointer text-center ${selected ? "bg-gray-800" : ""}`;
        return (
            <button type="button" className={itemClasses} onClick={handleClick}>
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
                    className="bg-slate-900 text-foreground w-8 rounded-full absolute -right-4 top-[52px] p-1 border border-black cursor-pointer"
                    onClick={() => setDrawerOpen(!drawerOpen)}
                />
            ) : (
                <ArrowRightIcon
                    className="bg-slate-900 text-foreground w-8 rounded-full absolute -right-4 top-[52px] p-1 border border-black cursor-pointer"
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
