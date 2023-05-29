import React from "react";

import type { InferGetServerSidePropsType, NextPage } from "next";
import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/router";

import { PrismaClient } from "@prisma/client";
import { LolApi } from "twisted";
import { z } from "zod";

import { getUserByNameAndServer } from "../../server/api/differentHelper";
import { regionToConstant } from "../../utils/champsUtils";
import { DATA_DRAGON_PROFIL_ICON, DATA_DRAGON_URL_SHORT } from "../../utils/constants";

const ProfilePage: NextPage<InferGetServerSidePropsType<typeof getServerSideProps>> = (props) => {
    const router = useRouter();
    const { server, username, profileIconId, summonerLevel, patch } = props;

    const profileIconUrl = `${DATA_DRAGON_URL_SHORT}/${patch}/${DATA_DRAGON_PROFIL_ICON}/${profileIconId}.png`;

    return (
        <div>
            <Head>
                <title>
                    LoL Mastery Tracker for {username} on {server}.
                </title>
                <meta property="og:title" content="LoL Mastery Tracker, brought to you by me!" key="title" />
                <meta
                    property="og:description"
                    content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
                />
                <meta property="og:image" content="https://lol.awot.dev/favicon.png" />
                <link rel="icon" href="/favicon.ico" />
            </Head>

            <div className="flex h-screen w-screen justify-center ">
                <ul className="flex flex-col text-xl">
                    <div className="h-5" />
                    <div className="flex flex-row items-center justify-center gap-6 relative">
                        <div className="absolute left-0">
                            <Image
                                src={profileIconUrl}
                                alt={`${profileIconId}`}
                                height={90}
                                width={90}
                                // hidden={hideAll}
                                // placeholderSrc="/placeholder.png"
                            />
                        </div>
                        <div className="items-center flex-col bg-clip-text text-transparent bg-gradient-to-r from-green-600 via-sky-600 to-purple-600">
                            <div className="text-6xl">{username}</div>
                            <div className="items-center flex flex-row justify-between ">
                                <div className="text-sm font-bold ">{server}</div>
                                <div className="text-sm font-bold ">{summonerLevel}</div>
                            </div>
                        </div>
                    </div>
                    <div className="h-10" />
                    <div className="flex flex-col items-center">
                        <div className="flex flex-col gap-6 ">
                            <div>
                                <Link href={router.asPath + "/mastery"} className="underline">
                                    Mastery Points Tracker
                                </Link>
                                <div className="text-sm">
                                    Tailored for the challenge{" "}
                                    <span className="italic font-bold">Catch &apos;em all</span>, but also works with{" "}
                                    <span className="italic font-bold">Master yourself</span> and{" "}
                                    <span className="italic font-bold">Master your enemy</span>
                                </div>
                            </div>
                            <div>
                                <Link href={router.asPath + "/different"} className="underline">
                                    [WIP] Champion Tracker
                                </Link>
                                <div className="text-sm">
                                    Manually keep track of specific heroes. For challenges such as{" "}
                                    <span className="italic font-bold">All Random All Champions</span>, with{" "}
                                    <span className="italic font-bold">Jack of All Champs</span>, and{" "}
                                    <span className="italic font-bold">Protean Override</span>
                                </div>
                            </div>
                            {/* <Link href={router.asPath + "/mastery"}>todo</Link>
                            <Link href={router.asPath + "/mastery"}>todo</Link> */}
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    );
};

const paramsSchema = z.object({
    server: z.string(),
    username: z.string(),
});

export const getServerSideProps = async (context) => {
    const { res, params } = context;

    res.setHeader("Cache-Control", "public, s-maxage=50, stale-while-revalidate=59");
    const { server, username } = paramsSchema.parse(params);
    const region = regionToConstant(server.toUpperCase());
    const prisma = new PrismaClient();
    const lolApi = new LolApi();

    const user = await getUserByNameAndServer({ prisma, lolApi }, username, region);

    const patch = (await prisma.championDetails.findMany())[0]?.version;

    // const apiChampsData = await getChampionsAndMastery(username);

    return {
        props: {
            username,
            server,
            profileIconId: user.profileIconId,
            summonerLevel: user.summonerLevel,
            patch,
        },
    };
};

export default ProfilePage;
