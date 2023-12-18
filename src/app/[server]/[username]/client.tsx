"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { DATA_DRAGON_PROFIL_ICON, DATA_DRAGON_URL_SHORT } from "~/utils/constants";

export default function Client({ server, username, profileIconId, summonerLevel, patch }) {
    const router = useRouter();
    console.log({ server, username, profileIconId, summonerLevel, patch });

    const profileIconUrl = `${DATA_DRAGON_URL_SHORT}/${patch}/${DATA_DRAGON_PROFIL_ICON}/${profileIconId}.png`;
    console.log(profileIconUrl);

    return (
        <div>
            <div className="flex h-screen w-screen justify-center">
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
                                // placeholder="/placeholder.png"
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
                                <button type="button" onClick={() => router.push("/mastery")} className="underline">
                                    Mastery Points Tracker
                                </button>
                                <div className="text-sm">
                                    Tailored for the challenge{" "}
                                    <span className="italic font-bold">Catch &apos;em all</span>, but also works with{" "}
                                    <span className="italic font-bold">Master yourself</span> and{" "}
                                    <span className="italic font-bold">Master your enemy</span>
                                </div>
                            </div>
                            <div>
                                <button type="button" onClick={() => router.push("/different")} className="underline">
                                    [WIP] Champion Tracker
                                </button>
                                <div className="text-sm">
                                    Manually keep track of specific heroes. For challenges such as{" "}
                                    <span className="italic font-bold">All Random All Champions</span>, with{" "}
                                    <span className="italic font-bold">Jack of All Champs</span>, and{" "}
                                    <span className="italic font-bold">Protean Override</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </ul>
            </div>
        </div>
    );
}
