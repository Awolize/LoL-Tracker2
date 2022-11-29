import React, { useEffect, useState } from "react";
import type {
  ChampionMasteryDTO,
  ChampionsDataDragonDetails,
} from "twisted/dist/models-dto";
import championJson from "./champions.json";
import rolesJson from "./roles.json";
import { trpc } from "../utils/trpc";
import { LazyLoadImage } from "react-lazy-load-image-component";
import { DATA_DRAGON_URL } from "../utils/constants";
import MyListbox from "./dropdown";

interface Roles {
  role: string;
}

type CompleteChamptionInfo = ChampionMasteryDTO &
  ChampionsDataDragonDetails &
  Roles;
type incompleteCompleteChamptionInfo = ChampionsDataDragonDetails & Roles;

const Champs = ({ userId }: { userId: string }) => {
  const [championMastery, setChampionMastery] =
    useState<CompleteChamptionInfo[]>();

  const { data, isLoading, isFetched, refetch } =
    trpc.riotApi.getMasteryPointsById.useQuery(
      {
        id: userId,
      },
      {
        enabled: false,
      }
    );

  useEffect(() => {
    if (!data && userId != null) {
      console.log("data.id:", userId);
      console.log("FETCHING CHAMPION MASTERY BY USER ID");
      refetch();
    }
  }, [data, refetch, userId]);

  useEffect(() => {
    if (championMastery == null && data) {
      console.log(data);
      const list = Object.keys(championJson.data).map((champName) => {
        const jsonInfo =
          championJson.data[champName as keyof typeof championJson.data];

        const personalChampData = data
          .filter((champ) => `${champ.championId}` == jsonInfo.key)
          .at(0);

        const champ: CompleteChamptionInfo | incompleteCompleteChamptionInfo = {
          ...jsonInfo,
          ...personalChampData,
          name: jsonInfo.name == "Nunu & Willump" ? "Nunu" : jsonInfo.name,
          championPoints: personalChampData?.championPoints ?? 0,
          championLevel: personalChampData?.championLevel ?? 0,
          role:
            rolesJson[jsonInfo.id as keyof typeof championJson.data] ??
            "Unknown",
        };
        return champ;
      });

      setChampionMastery(list as CompleteChamptionInfo[]);
    }
  }, [championMastery, data]);

  const listItem = (champ: CompleteChamptionInfo) => {
    const disabled = filteredOut(champ);
    return (
      <li className="flex flex-col pb-2" key={champ.key as React.Key}>
        {/* Image doesnt work in production, only loads about 6 images and then times out on the rest, container restrictions (ram,etc)? */}

        <div className="relative z-10">
          <span className="absolute top-[5px] left-[5px] rounded-full bg-blue-800 px-[0.40rem] text-center text-xs leading-5">
            {champ.championLevel}
          </span>
          <LazyLoadImage
            src={`${DATA_DRAGON_URL}${champ.image.full}`}
            style={{
              opacity: disabled ? "40%" : "100%",
            }}
            className={` ${disabled ? "grayscale" : ""}`}
            alt={`${champ.name}`}
            height={100}
            width={100}
          />
        </div>

        <div className="text-center text-xs">{champ.name}</div>
        <div className="items-center justify-center text-center text-xs">
          {champ.championPoints}
        </div>
      </li>
    );
  };

  const [filterPoints, setFilterPoints] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);

  console.log(sortOrder);

  const filteredOut = (champ: CompleteChamptionInfo) => {
    const disabled: boolean = champ.championPoints > filterPoints;
    return disabled;
  };
  const sortAlgorithm = (
    a: CompleteChamptionInfo,
    b: CompleteChamptionInfo
  ): number => {
    switch (sortOrder) {
      case 0:
        return a.name.localeCompare(b.name);
      case 1:
        return a.championPoints > b.championPoints ? -1 : 1;
      case 2:
        if (a.championLevel === b.championLevel)
          return a.championPoints > b.championPoints ? -1 : 1;
        else return a.championLevel > b.championLevel ? -1 : 1;
      default:
        return a.name.localeCompare(b.name);
    }
  };

  const markedSize: number =
    championMastery?.filter((champ) => filteredOut(champ)).length ?? 0;

  if (!isLoading && isFetched && championMastery)
    return (
      <>
        <header className="mt-2 flex justify-center">
          <div className="fixed top-8 left-8 z-50 w-32">
            <MyListbox
              callback={setFilterPoints}
              defaultIndex={4}
              choices={[
                { text: "100", value: 100 },
                { text: "500", value: 500 },
                { text: "1,000", value: 1000 },
                { text: "5,000", value: 5000 },
                { text: "10,000", value: 10000 },
                { text: "50,000", value: 50000 },
                { text: "100,000", value: 100000 },
              ]}
            />
          </div>
          <div className="fixed top-8 left-44 z-50 flex flex-row items-center gap-2">
            Sort:
            <div className="w-32">
              <MyListbox
                callback={setSortOrder}
                defaultIndex={0}
                choices={[
                  { text: "A-Z", value: 0 },
                  { text: "Points", value: 1 },
                  { text: "Level", value: 2 },
                ]}
              />
            </div>
          </div>
          <div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
            <div className="flex h-full flex-col  justify-between rounded-lg bg-black px-4  py-2 text-center text-white ">
              <p className="text-2xl">
                {markedSize} / {championMastery?.length}
              </p>
              <p className="text-sm">
                {((100 * markedSize) / championMastery?.length).toFixed(2)}%{" "}
              </p>
            </div>
          </div>
        </header>

        <main>
          <div className="flex flex-row gap-2">
            {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
              const champsWithRole = championMastery.filter((champ) => {
                return champ.role === role;
              });

              const doneChamps = champsWithRole
                .filter(filteredOut)
                .sort(sortAlgorithm);

              const todoChamps = champsWithRole
                .filter((champ) => !filteredOut(champ))
                .sort(sortAlgorithm);

              const size: number = champsWithRole.length;
              const markedSize: number = champsWithRole.filter((champ) =>
                filteredOut(champ)
              ).length;
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
      </>
    );
  else {
    return <main>Getting your user info information...</main>;
  }
};

export default Champs;
