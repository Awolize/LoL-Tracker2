"use client";

import { useRef, useState } from "react";

import Head from "next/head";
import { useRouter } from "next/navigation";
import LoadingComponent from "../_components/loading-spinner";
import Row from "../_components/row";
import ServerListSelector, { servers } from "../_components/server-list-selector";

export default function Page() {
    const router = useRouter();
    const usernameRef = useRef<HTMLInputElement>(null);
    const gameTagRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [selectedServer, setSelectedServer] = useState(servers[0]);

    function onSubmit(e: React.FormEvent) {
        e.preventDefault();
        console.log(
            `Redirecting to "/${selectedServer?.name}/${usernameRef.current?.value}-${gameTagRef.current?.value}..."`,
        );
        router.push(`/${selectedServer?.name}/${usernameRef.current?.value}-${gameTagRef.current?.value}`);
        setLoading(true);
    }

    return (
        <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
            <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem] ">
                    Search{" "}
                    <div className="inline-block">
                        <ServerListSelector selectedServer={selectedServer} setSelectedServer={setSelectedServer} />
                    </div>{" "}
                    Summoner Profile
                </h1>
                <form className="grid grid-rows-1 gap-4 sm:grid-rows-2 md:gap-8" onSubmit={onSubmit}>
                    <Row className={"gap-1 items-center"}>
                        <input
                            type="text"
                            ref={usernameRef}
                            placeholder="lol.awot"
                            className="h-12 rounded bg-gray-700 text-center text-xl placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                        #
                        <input
                            type="text"
                            ref={gameTagRef}
                            placeholder="dev"
                            className="h-12 rounded bg-gray-700 text-center text-xl placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />
                    </Row>
                    <button
                        type="submit"
                        className="flex items-center justify-center gap-4 rounded-xl  bg-white/10 p-4 text-white hover:bg-white/20"
                    >
                        {loading ? (
                            <LoadingComponent />
                        ) : (
                            <h3 className="justify-center text-center font-bold">Look up</h3>
                        )}
                    </button>
                </form>
            </div>
        </main>
    );
}
