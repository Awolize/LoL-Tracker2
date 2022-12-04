import { useRouter } from "next/router";
import React, { useEffect } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import { filteredOut, sortAlgorithm } from "../utils/champsUtils";
import { DATA_DRAGON_URL } from "../utils/constants";
import { trpc } from "../utils/trpc";
import championJson from "./champions.json";
import rolesJson from "./roles.json";

interface Roles {
  role: string;
}

type CompleteChamptionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;
type incompleteCompleteChamptionInfo = ChampionsDataDragonDetails & Roles;

const ChampsContent = ({
  filterPoints,
  sortOrder,
  showLevels,
  showFinished,
  championMastery,
  setChampionMastery,
}: {
  championMastery: CompleteChamptionInfo[];
  setChampionMastery: (data: CompleteChamptionInfo[]) => void;
  filterPoints: number;
  sortOrder: number;
  showLevels: boolean;
  showFinished: boolean;
}) => {
  const router = useRouter();
  const { username } = router.query;

  // Get user information (needed for second request)
  const summonerData = trpc.riotApi.getUserByName.useQuery(
    { username: username as string },
    { enabled: typeof username == "string" }
  );

  // get Champion Mastery points
  const { data, isFetched } = trpc.riotApi.getMasteryPointsById.useQuery(
    { id: summonerData.data?.id ?? "" }, // should never be able to be null/undefined
    { enabled: summonerData?.data?.id != null && typeof summonerData.data.id == "string" }
  );

  useEffect(() => {
    if (championMastery.length == 0 && data) {
      const list = Object.keys(championJson.data).map((champName) => {
        const jsonInfo = championJson.data[champName as keyof typeof championJson.data];

        const personalChampData = data.filter((champ) => `${champ.championId}` == jsonInfo.key).at(0);

        // build champ objects
        const champ: CompleteChamptionInfo | incompleteCompleteChamptionInfo = {
          ...jsonInfo,
          ...personalChampData,
          name: jsonInfo.name == "Nunu & Willump" ? "Nunu" : jsonInfo.name,
          championPoints: personalChampData?.championPoints ?? 0,
          championLevel: personalChampData?.championLevel ?? 0,
          role: rolesJson[jsonInfo.id as keyof typeof championJson.data] ?? "Unknown",
        };
        return champ;
      });

      setChampionMastery(list as CompleteChamptionInfo[]);
    }
  }, [championMastery, data, setChampionMastery]);

  const listItem = (champ: CompleteChamptionInfo) => {
    const disabled = filteredOut(champ, filterPoints);
    const hideAll = disabled && !showFinished;

    return (
      <li className="flex flex-col pb-2" key={champ.key as React.Key}>
        {/* Image doesnt work in production, only loads about 6 images and then times out on the rest, container restrictions (ram,etc)? */}

        <div className="relative z-10">
          {showLevels && !hideAll && (
            <span className="absolute top-[3px] left-[3px] flex h-6 w-6 items-center justify-center bg-blue-800 px-[0.40rem] text-center text-xs leading-5">
              {champ.championLevel}
            </span>
          )}
          <LazyLoadImage
            src={`${DATA_DRAGON_URL}${champ.image.full}`}
            style={{
              zIndex: -1,
              opacity: disabled ? "40%" : "100%",
            }}
            className={` ${disabled ? "grayscale" : ""}`}
            alt={`${champ.name}`}
            height={90}
            width={90}
            effect="opacity"
            hidden={hideAll}
            // placeholderSrc="/placeholder.png"
          />
        </div>

        <div className="text-center text-xs">{!hideAll && champ.name}</div>
        <div className="items-center justify-center text-center text-xs">{!hideAll && champ.championPoints}</div>
      </li>
    );
  };

  const handleRender = () => {
    if (isFetched && championMastery) {
      return (
        <main>
          <div className="flex flex-row gap-2">
            {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
              const champsWithRole = championMastery.filter((champ) => {
                return champ.role === role;
              });

              const doneChamps = champsWithRole
                .filter((champ) => filteredOut(champ, filterPoints))
                .sort((a, b) => sortAlgorithm(sortOrder, a, b));

              const todoChamps = champsWithRole
                .filter((champ) => !filteredOut(champ, filterPoints))
                .sort((a, b) => sortAlgorithm(sortOrder, a, b));

              const size: number = champsWithRole.length;
              const markedSize: number = champsWithRole.filter((champ) => filteredOut(champ, filterPoints)).length;
              const percentage = (100 * markedSize) / size;

              return (
                <div className="w-full p-4" key={role}>
                  <div className="text-md flex flex-row justify-center gap-8 align-bottom ">
                    <h4 className="my-auto p-2  ">
                      {markedSize} / {size}
                    </h4>
                    <div className="mb-2 bg-gradient-to-r from-green-600 via-sky-600 to-purple-600 pb-[3px]">
                      <div className="flex h-full flex-col justify-between bg-black text-gray-200 ">
                        <h4 className="text-xl font-bold">{role}</h4>
                      </div>
                    </div>
                    <h4 className="my-auto p-2 ">{percentage.toFixed(1)}%</h4>
                  </div>
                  <ul
                    className="grid justify-between"
                    style={{
                      gridTemplateColumns: "repeat(auto-fill, 90px)",
                    }}
                  >
                    {todoChamps.map((champ) => listItem(champ))}
                    {doneChamps.map((champ) => listItem(champ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </main>
      );
    } else if (summonerData.isFetched && summonerData.data?.id) {
      return <main>Getting your mastery points...</main>;
    } else if (username) {
      return <main>Welcome {username} getting your user info information... & Getting your mastery points...</main>;
    } else {
      <></>;
    }
  };

  return <>{handleRender()}</>;
};

export default ChampsContent;
