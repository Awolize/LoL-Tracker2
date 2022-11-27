import React, { useEffect, useRef, useState } from "react";

import { ChampionMasteryDTO } from "twisted/dist/models-dto";
import championJson from "./champions.json";
import rolesJson from "./roles.json";
// import { LolApi } from "twisted";
// const api = new LolApi();

import { trpc } from "../utils/trpc";
import { LazyLoadImage } from "react-lazy-load-image-component";
const DATA_DRAGON_URL =
  "https://ddragon.leagueoflegends.com/cdn/12.21.1/img/champion/";

interface RiotImage {
  full: string;
  sprite: string;
  group: string;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface ChampInfo {
  name: String;
  id: String;
  image: RiotImage;
  url: String;
  key: String;
  role: String;
}

const Champs = ({ userId }) => {
  const [championMastery, setChampionMastery] =
    useState<(ChampionMasteryDTO & ChampInfo)[]>();

  const { data, isLoading, isFetched, isFetching, refetch } =
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
  }, [userId]);

  useEffect(() => {
    if (championMastery == null && data) {
      const list = Object.keys(championJson.data).map((champName) => {
        const jsonInfo = championJson.data[champName];
        const champ: ChampInfo = {
          url: jsonInfo.url,
          id: jsonInfo.id,
          key: jsonInfo.key,
          name: jsonInfo.name == "Nunu & Willump" ? "Nunu" : jsonInfo.name,
          image: jsonInfo.image,
          role: rolesJson[`${jsonInfo.id}`] ?? "Unknown",
        };

        // api.DataDragon.getChampion(champ.key).then((res) => {
        //   console.log(res);
        // });
        const personalChampData = data.filter(
          (champ) => champ.championId == jsonInfo.key
        )[0]!;

        return { ...champ, ...personalChampData };
      });

      setChampionMastery(list);
    }
  }, [data]);

  const listItem = (champ: ChampionMasteryDTO & ChampInfo) => {
    const filteredOut: boolean = champ.championPoints > 10000;
    return (
      <li className="flex flex-col pb-2" key={champ.key}>
        {/* Image doesnt work in production, only loads about 6 images and then times out on the rest, container restrictions (ram,etc)? */}

        <LazyLoadImage
          src={`${DATA_DRAGON_URL}${champ.image.full}`}
          style={{
            opacity: filteredOut ? "40%" : "100%",
          }}
          className={filteredOut ? "grayscale" : "grayscale-0"}
          alt={champ.name}
          height={100}
          width={100}
        />

        <div className="text-center text-xs">{champ.name}</div>
        <div className="text-center text-xs">{champ.championPoints}</div>
      </li>
    );
  };

  const markedSize: number =
    championMastery?.filter((champ) => champ.championPoints > 10000).length ??
    0;

  if (!isLoading && isFetched && championMastery)
    return (
      <>
        <header className="mt-2 flex  flex-row justify-center gap-2 text-center leading-loose">
          <div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
            <div className="flex h-full flex-col justify-between rounded-lg bg-black  px-4 py-2 text-white ">
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
              console.log(role, champsWithRole.length);

              const size: number = champsWithRole.length;
              const markedSize: number = champsWithRole.filter(
                (champ) => champ.championPoints > 10000
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
                    {champsWithRole.map((champ) => listItem(champ))}
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
