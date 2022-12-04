import { Switch } from "@headlessui/react";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/20/solid";
import React, { useState } from "react";
import "react-lazy-load-image-component/src/effects/opacity.css";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import Dropdown from "./Dropdown";

interface Roles {
  role: string;
}

type CompleteChamptionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const ChampsHeader = ({
  championMastery = [],
  setFilterPoints,
  setSortOrder,
  markedSize,
  showLevels,
  showFinished,
  setShowLevels,
  setShowFinished,
}: {
  championMastery: CompleteChamptionInfo[];
  setFilterPoints: (data: number) => void;
  setSortOrder: (data: number) => void;
  markedSize: number;
  showLevels: boolean;
  showFinished: boolean;
  setShowLevels: (data: boolean) => void;
  setShowFinished: (data: boolean) => void;
}) => {
  const [alignHeaderRight, setAlignHeaderRight] = useState(false);

  return (
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
          Sort:
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
  );
};

export default ChampsHeader;
