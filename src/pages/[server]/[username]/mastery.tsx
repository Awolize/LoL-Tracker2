import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import React, { useState } from "react";
import { LazyLoadImage } from "react-lazy-load-image-component";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { LolApi, Constants } from "twisted";
import Dropdown from "../../../components/Dropdown";
import { filteredOut, sortAlgorithm } from "../../../utils/champsUtils";
import { DATA_DRAGON_URL } from "../../../utils/constants";
import championJson from "./champions.json";
import rolesJson from "./roles.json";

import type { NextPage, InferGetServerSidePropsType } from "next";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";

interface Roles {
  role: string;
}

type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Mastery: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const champs = props.champData;
  const championMastery = props.champData;

  const [filterPoints, setFilterPoints] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [showLevels, setShowLevels] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const markedSize: number = championMastery.filter((champ) => filteredOut(champ, filterPoints)).length ?? 0;
  const [alignHeaderRight, setAlignHeaderRight] = useState(false);

  const listItem = (champ: CompleteChampionInfo) => {
    const disabled = filteredOut(champ, filterPoints);
    const hideAll = disabled && !showFinished;

    return (
      <li className="flex flex-col pb-2" key={champ.key as React.Key}>
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

  //Partition function
  function partition(array, filter) {
    const pass: CompleteChampionInfo[] = [],
      fail: CompleteChampionInfo[] = [];
    array.forEach((e: CompleteChampionInfo, idx, arr) => (filter(e, idx, arr) ? pass : fail).push(e));
    return [pass, fail];
  }

  return (
    <>
      <Head>
        <title>
          LoL Mastery Tracker for {props.username} on {props.server}.
        </title>
        <meta property="og:title" content="LoL Mastery Tracker, brought to you by me!" key="title" />
        <meta
          property="og:description"
          name="description"
          content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
        />
        <meta property="og:image" content="https://lol.awot.dev/favicon.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <header className="relative mt-2 flex justify-center">
        <div
          className={`absolute top-6 z-50 flex w-full flex-row items-center  justify-start  gap-4 px-4 ${
            alignHeaderRight ? "flex-row-reverse" : "flex-row"
          }`}
        >
          <div className="w-32">
            <Dropdown
              callback={setFilterPoints}
              saveName="points"
              choices={[
                {
                  text: "All",
                  value: Number.MAX_SAFE_INTEGER,
                },
                { text: "100", value: 100 },
                { text: "500", value: 500 },
                { text: "1,000", value: 1000 },
                { text: "5,000", value: 5000 },
                { text: "10,000", value: 10000 },
                { text: "21,600", value: 21600 },
                { text: "50,000", value: 50000 },
                { text: "100,000", value: 100000 },
              ]}
            />
          </div>
          <div className="flex flex-row items-center gap-2">
            <div className="w-32">
              <Dropdown
                callback={setSortOrder}
                saveName="sortOrder"
                choices={[
                  { text: "Points", value: 0 },
                  { text: "A-Z", value: 1 },
                  { text: "Level", value: 2 },
                ]}
              />
            </div>
          </div>

          <div className="flex flex-row items-center gap-2">
            <span>Show Levels</span>
            <Switch
              checked={showLevels}
              onChange={setShowLevels}
              className={`${
                showLevels ? "bg-blue-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Show Levels</span>
              <span
                className={`${
                  showLevels ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>
          <div className="flex flex-row items-center gap-2">
            <span>Show finished</span>
            <Switch
              checked={showFinished}
              onChange={setShowFinished}
              className={`${
                showFinished ? "bg-blue-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Show finished</span>
              <span
                className={`${
                  showFinished ? "translate-x-6" : "translate-x-1"
                } inline-block h-4 w-4 transform rounded-full bg-white transition`}
              />
            </Switch>
          </div>

          <div className="flex pr-4">
            <button onClick={() => setAlignHeaderRight((prev) => !prev)}>
              <span className="absolute inset-y-0 flex items-center pr-2">
                {alignHeaderRight ? (
                  <ChevronLeftIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                ) : (
                  <ChevronRightIcon className="h-5 w-5 text-gray-100" aria-hidden="true" />
                )}
              </span>
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
          <div className="flex h-full flex-col  justify-between rounded-lg bg-black px-4 py-2 text-center text-white ">
            <p className="text-2xl">
              {markedSize} / {championMastery?.length}
            </p>
            <p className="text-sm">{((100 * markedSize) / championMastery?.length).toFixed(2)}% </p>
          </div>
        </div>
      </header>
      <main>
        <div className="flex flex-row gap-2">
          {["Top", "Jungle", "Mid", "Bottom", "Support"].map((role) => {
            if (!champs[0]) return;

            const champsWithRole = champs.filter((champ) => {
              return champ?.role === role;
            });

            const [doneChamps, todoChamps] = partition(champsWithRole, (champ) => filteredOut(champ, filterPoints));
            doneChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));
            todoChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));

            const size: number = champsWithRole.length;
            const markedSize: number = champsWithRole.filter((champ) => {
              if (champ == undefined) return false;
              return filteredOut(champ, filterPoints);
            }).length;
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
                  {todoChamps?.map((champ) => listItem(champ as CompleteChampionInfo))}
                  {doneChamps?.map((champ) => listItem(champ as CompleteChampionInfo))}
                </ul>
              </div>
            );
          })}
        </div>
      </main>
    </>
  );
};

export const getServerSideProps = async (context) => {
  const { params } = context;
  const { server, username } = params;
  console.log("server, username:", server, username);

  const api = new LolApi();

  const getChampionsAndMastery = async (username) => {
    const getByNameResponse = await api.Summoner.getByName(username, Constants.Regions.EU_WEST);
    const id = getByNameResponse.response.id;

    const response2 = await api.Champion.masteryBySummoner(id, Constants.Regions.EU_WEST);
    return response2.response;
  };

  const apiChampsData = await getChampionsAndMastery(username);
  const completeChampsData = Object.keys(championJson.data)
    .map((champName) => {
      const element: ChampionsDataDragonDetails = championJson.data[champName];
      const role = rolesJson[champName as keyof typeof championJson.data] ?? "Unknown";

      const personalChampData = apiChampsData.filter((champ) => champ.championId.toString() == element.key).at(0);
      if (personalChampData) {
        return {
          ...element,
          ...personalChampData,
          championPoints: personalChampData?.championPoints ?? 0,
          championLevel: personalChampData?.championLevel ?? 0,
          role: role,
          name: element.name === "Nunu & Willump" ? "Nunu" : element.name,
        } as CompleteChampionInfo;
      } else {
        return {
          ...element,
          championPoints: 0,
          championLevel: 0,
          role,
        } as CompleteChampionInfo;
      }
    })
    .filter(Boolean);

  return { props: { username, server, champData: completeChampsData } };
};

export default Mastery;
