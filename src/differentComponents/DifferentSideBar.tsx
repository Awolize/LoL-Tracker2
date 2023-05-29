import { useState } from "react";

import { ArrowLeftIcon, ArrowRightIcon } from "@heroicons/react/20/solid";
import type { ChallengeLocalization, Prisma } from "@prisma/client";

import { api } from "../utils/api";

export const DifferentSideBar = ({ server, username, selectedItem, setSelectedItem }) => {
    const [drawerOpen, setDrawerOpen] = useState(true);

    const [searchTerm, setSearchTerm] = useState("");

    const handleItemClick = (itemId) => {
        setSelectedItem(itemId);
    };

    const refreshQuery = api.differentApi.updateChallengeConfig.useQuery({ server, username }, { enabled: false });
    const refreshQuery2 = api.differentApi.updateGames.useQuery(
        { server, username, count: 10 },
        {
            enabled: false,
            onSuccess(data) {
                console.log(data);
            },
        }
    );
    const refreshQuery3 = api.differentApi.updateJackOfAllChamps.useQuery({ server, username }, { enabled: false });
    if (refreshQuery3.data) {
        console.log(refreshQuery3.data);
    }

    const { data: challenges } = api.differentApi.getChallengesConfig.useQuery({ server, username });

    // Filter challenges based on search term
    const filteredChallenges = challenges?.data.filter((item) => {
        const local = item?.localizedNames;
        const enUSName = local.find((name) => name.language === "en_US")?.name;
        const enUSDescription = local.find((name) => name.language === "en_US")?.description;

        return (
            enUSName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
            enUSDescription?.toLowerCase().includes(searchTerm.toLowerCase())
        );
    });

    const keystoneChallenges = challenges?.keystones;

    const LastItem = ({ selected }) => {
        const handleClick = () => {
            refreshQuery.refetch();
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
            refreshQuery2.refetch();
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
            refreshQuery3.refetch();
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
                <div className="flex flex-col h-full">
                    <p className="text-center mb-2 border-b border-gray-600 ">Challenges</p>
                    <input
                        type="text"
                        placeholder="Search..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="bg-gray-800 rounded px-2 py-1 my-1"
                    />
                    <ul className="flex flex-col gap-1 overflow-y-auto">
                        {filteredChallenges?.map((item) => (
                            <Item
                                key={item.id}
                                item={item}
                                selected={selectedItem === item.id}
                                onItemClick={handleItemClick}
                            />
                        ))}
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
}: {
    item: {
        id: number;
        localizedNames: ChallengeLocalization[];
    };
    selected: boolean;
    onItemClick: (itemId: number) => void;
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
            className={`px-4 duration-300 py-2 cursor-pointer rounded-sm ${selected ? "bg-gray-800" : ""}`}
            onClick={handleClick}
        >
            <p className="text-sm">{text}</p>
            <p className="text-xs opacity-50">{description}</p>
        </li>
    );
};
