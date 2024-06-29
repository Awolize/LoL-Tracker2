"use client";

export const useDataDragonPath = (version) => {
	const getChampionImage = (championName) => {
		return `/api/images/cdn/${version}/img/champion/${championName}`;
	};

	return { getChampionImage };
};
