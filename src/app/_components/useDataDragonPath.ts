"use client";

import { useEffect, useState } from "react";

import { DataDragonService } from "twisted/dist/apis/lol/dataDragon/DataDragonService";

export const useDataDragonPath = () => {
	const [dataDragonPath, setDataDragonPath] = useState("");

	useEffect(() => {
		const fetchDataDragonPath = async () => {
			try {
				const dataDragonService = new DataDragonService(); // Create an instance of your DataDragonService
				const versions = await dataDragonService.getVersions();
				const latestVersion = versions[0];
				const path = `https://ddragon.leagueoflegends.com/cdn/${latestVersion}/img/champion`;
				setDataDragonPath(path);
			} catch (error) {
				console.error("Error fetching Data Dragon path:", error);
			}
		};

		fetchDataDragonPath();
	}, []); // Update the path when championName changes

	const getChampionImage = (championName) => {
		return `${dataDragonPath}/${championName}`;
	};

	return getChampionImage;
};
