import React, { useState } from "react";
import "react-lazy-load-image-component/src/effects/opacity.css";
import type { ChampionMasteryDTO, ChampionsDataDragonDetails } from "twisted/dist/models-dto";
import ChampsContent from "../../../components/Content";
import ChampsHeader from "../../../components/Header";
import { filteredOut } from "../../../utils/champsUtils";

interface Roles {
  role: string;
}

type CompleteChamptionInfo = ChampionMasteryDTO & ChampionsDataDragonDetails & Roles;

const Champs = () => {
  const [championMastery, setChampionMastery] = useState<CompleteChamptionInfo[]>([]);
  const [filterPoints, setFilterPoints] = useState(0);
  const [sortOrder, setSortOrder] = useState(0);
  const [showLevels, setShowLevels] = useState(false);
  const [showFinished, setShowFinished] = useState(false);
  const markedSize: number = championMastery.filter((champ) => filteredOut(champ, filterPoints)).length ?? 0;

  return (
    <>
      <ChampsHeader
        championMastery={championMastery ?? []}
        markedSize={markedSize}
        setFilterPoints={setFilterPoints}
        setSortOrder={setSortOrder}
        showLevels={showLevels}
        setShowLevels={setShowLevels}
        showFinished={showFinished}
        setShowFinished={setShowFinished}
      />
      <ChampsContent
        championMastery={championMastery}
        setChampionMastery={setChampionMastery}
        showLevels={showLevels}
        showFinished={showFinished}
        filterPoints={filterPoints}
        sortOrder={sortOrder}
      />
    </>
  );
};

export default Champs;
