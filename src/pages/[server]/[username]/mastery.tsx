import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import Head from "next/head";
import React, { useEffect, useState } from "react";
import Image from "next/image";
import "react-lazy-load-image-component/src/effects/opacity.css";
import { LolApi } from "twisted";
import Dropdown from "../../../components/Dropdown";
import { filteredOut, regionToConstant, sortAlgorithm } from "../../../utils/champsUtils";
import { DATA_DRAGON_URL } from "../../../utils/constants";
import championJson from "./champions.json";
import rolesJson from "./roles.json";

import type { NextPage, InferGetServerSidePropsType } from "next";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import type { ChallengeV1DTO } from "twisted/dist/models-dto/challenges/challenges.dto";

interface Roles {
  role: string;
}

type CompleteChampionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Mastery: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
  const champs = props.champData;
  const championMastery = props.champData;
  const patch = props.patch;
  const challenges = props.challenges;
  const challengesThresholds = props.challengesThresholds;

  const [filterPoints, setFilterPoints] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [showLevel, setShowLevel] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const [hideChampionsMode, setHideChampionsMode] = useState(false);
  const markedSize: number = championMastery.filter((champ) => filteredOut(champ, filterPoints)).length ?? 0;
  const [alignHeaderRight, setAlignHeaderRight] = useState(false);

  const [hiddenChamps, setHiddenChamps] = useState(new Set<number>());

  useEffect(() => {
    // check if the hiddenChamps item is present in local storage
    const hiddenChampsString = localStorage.getItem("hiddenChamps");
    if (hiddenChampsString) {
      // if present, set the hiddenChamps state to the value stored in local storage
      setHiddenChamps(new Set(JSON.parse(hiddenChampsString)));
    }
  }, []);

  const handleChampionClick = (championId: number) => {
    console.log(championId);
    console.log(hideChampionsMode);

    if (hideChampionsMode === true) {
      if (hiddenChamps.has(championId)) {
        hiddenChamps.delete(championId);
      } else {
        hiddenChamps.add(championId);
      }
      setHiddenChamps(new Set(hiddenChamps));

      // save the hiddenChamps set to local storage
      localStorage.setItem("hiddenChamps", JSON.stringify([...hiddenChamps]));
    }
  };

  const listItem = (champ: CompleteChampionInfo) => {
    const disabled = filteredOut(champ, filterPoints);
    const hide = disabled && !showFinished;

    return (
      <li
        className="flex flex-col pb-2"
        key={champ.key as React.Key}
        onClick={() => handleChampionClick(champ.championId)}
      >
        <div className="relative z-10">
          {showLevel && !hide && (
            <span className="absolute top-[3px] left-[3px] flex h-6 w-6 items-center justify-center bg-blue-800 px-[0.40rem] text-center text-xs leading-5">
              {champ.championLevel}
            </span>
          )}
          {!hide && (
            <Image
              src={`${DATA_DRAGON_URL}${champ.image.full}`}
              style={{
                zIndex: -1,
                opacity: disabled ? "40%" : "100%",
              }}
              className={`${hiddenChamps.has(champ.championId) ? "grayscale brightness-50" : ""} ${
                disabled ? "grayscale" : ""
              }`}
              alt={`${champ.name}`}
              height={90}
              width={90}
              // hidden={hideAll}
              // placeholderSrc="/placeholder.png"
            />
          )}
        </div>

        <div className="text-center text-xs">{!hide && champ.name}</div>
        <div className="items-center justify-center text-center text-xs">{!hide && champ.championPoints}</div>
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

  function renderChallenge(challenge: ChallengeV1DTO, index: number) {
    const descriptions = ["Win a game without dying", "Earn an S+ grade", "Win a game"];

    const values = Object.entries(challengesThresholds[index]!).map((threshold) => ({
      value: threshold[1],
      style: "text-gray-400",
    }));
    values.push({ value: challenge.value, style: "text-gray-100" });
    values.sort((a, b) => a.value - b.value);
    const title = values.join(" ");

    return (
      <>
        <div title={title}>{descriptions[index]}</div>
        <div className="flex gap-1">
          {values.map((v) => (
            <span key={`${v.value}-${v.style}`} className={v.style}>
              {v.value}
            </span>
          ))}
        </div>
      </>
    );
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

      <header className="relative mt-2 flex flex-row gap-8 z-50 px-5">
        <div
          className={`w-full min-w-fit flex items-center justify-start gap-4 ${
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
              checked={showLevel}
              onChange={setShowLevel}
              className={`${
                showLevel ? "bg-blue-600" : "bg-gradient-to-r from-indigo-500 to-purple-500"
              } relative inline-flex h-6 w-11 items-center rounded-full`}
            >
              <span className="sr-only">Show Levels</span>
              <span
                className={`${
                  showLevel ? "translate-x-6" : "translate-x-1"
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

          <div className="flex flex-row items-center gap-2">
            <Switch checked={hideChampionsMode} onChange={setHideChampionsMode}>
              <span className="sr-only">Show finished</span>
              <span className={`justify-center items-center content-center w-full h-full transform transition`}>
                {hideChampionsMode ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M2.036 12.322a1.012 1.012 0 010-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178z"
                    />
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                ) : (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                    stroke="currentColor"
                    className="w-6 h-6"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M3.98 8.223A10.477 10.477 0 001.934 12C3.226 16.338 7.244 19.5 12 19.5c.993 0 1.953-.138 2.863-.395M6.228 6.228A10.45 10.45 0 0112 4.5c4.756 0 8.773 3.162 10.065 7.498a10.523 10.523 0 01-4.293 5.774M6.228 6.228L3 3m3.228 3.228l3.65 3.65m7.894 7.894L21 21m-3.228-3.228l-3.65-3.65m0 0a3 3 0 10-4.243-4.243m4.242 4.242L9.88 9.88"
                    />
                  </svg>
                )}
              </span>
            </Switch>
          </div>

          <div className="flex pr-4">
            <button onClick={() => setAlignHeaderRight((prev) => !prev)} accessKey="s" aria-label="change side">
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

        <div className="w-80 min-w-fit">
          <div className="rounded-xl bg-gradient-to-r from-green-500 via-sky-500 to-purple-500 p-[3px]">
            <div className="flex h-full flex-col justify-between rounded-lg bg-black px-4 py-2 text-center text-white ">
              <p className="text-2xl">
                {markedSize} / {championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length}
                {championMastery.length !=
                championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length
                  ? "*"
                  : ""}
              </p>
              <p className="text-sm">
                {(
                  (100 * markedSize) /
                  championMastery.filter((champ) => !hiddenChamps.has(champ.championId))?.length
                ).toFixed(2)}
                %{" "}
              </p>
            </div>
          </div>
        </div>

        <div className="flex w-full min-w-fit">
          <div className="flex flex-col gap-0">
            <div className="text-md">
              Different champions (<span className="text-gray-400">{patch}</span>)
            </div>
            {challenges.length == 3 ? (
              <div className="grid grid-cols-2 text-xs text-gray-400">
                {challenges.map((el, index) => renderChallenge(el, index))}
              </div>
            ) : (
              <></>
            )}
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

            const champsWithRoleHiddenExcluded = hideChampionsMode
              ? champsWithRole
              : champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId));

            const [doneChamps, todoChamps] = partition(champsWithRoleHiddenExcluded, (champ) =>
              filteredOut(champ, filterPoints)
            );
            doneChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));
            todoChamps?.sort((a, b) => sortAlgorithm(sortOrder, a, b));

            const size: number = champsWithRole.filter((champ) => !hiddenChamps.has(champ.championId)).length;
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
                    {champsWithRole.length != size ? "*" : ""}
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
  const { res } = context;
  res.setHeader("Cache-Control", "public, s-maxage=50, stale-while-revalidate=59");

  const { params } = context;
  const { server, username } = params;
  console.log("server, username:", server, username);

  const region = regionToConstant(server);

  const api = new LolApi();

  const masteryBySummoner = async (user) => {
    return await (
      await api.Champion.masteryBySummoner(user.id, region)
    ).response;
  };

  const getChallengesData = async (user) => {
    const response = await api.Challenges.getPlayerData(user.puuid, region);
    const savedChallenges = [202303, 210001, 401106];
    const filteredChallenges = response.response.challenges.filter((challenge) =>
      savedChallenges.includes(challenge.challengeId)
    );
    return filteredChallenges;
  };

  const getChallengesThresholds = async () => {
    const challengeIds = [202303, 210001, 401106];
    const thresholdsList: { [key: string]: number }[] = [];
    for (const challengeId of challengeIds) {
      const thresholds = (await api.Challenges.getChallengeConfig(challengeId, region)).response;
      thresholdsList.push(thresholds.thresholds);
    }
    return thresholdsList;
  };

  const getByNameResponse = await api.Summoner.getByName(username, region);
  const user = getByNameResponse.response;

  const [championMasteries, playerChallenges, challengesThresholds] = await Promise.all([
    masteryBySummoner(user),
    getChallengesData(user),
    getChallengesThresholds(),
  ]);

  // const apiChampsData = await getChampionsAndMastery(username);
  const championsDD = await api.DataDragon.getChampion();
  const patch = championsDD.version;

  const completeChampsData = Object.keys(championsDD.data)
    .map((champName) => {
      const element: ChampionsDataDragonDetails = championsDD.data[champName];
      const role = rolesJson[champName as keyof typeof championsDD.data] ?? "Unknown";

      const personalChampData = championMasteries.filter((champ) => champ.championId.toString() == element.key).at(0);

      if (personalChampData) {
        return {
          image: element.image,
          id: element.id,
          key: element.key,
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
          championId: parseInt(element.key, 10),
          role,
        } as CompleteChampionInfo;
      }
    })
    .filter(Boolean);

  return {
    props: {
      username,
      server,
      champData: completeChampsData,
      challenges: playerChallenges,
      challengesThresholds: challengesThresholds,
      patch,
    },
  };
};

export default Mastery;
