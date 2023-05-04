import { Listbox, Menu } from "@headlessui/react";
import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef, useState } from "react";

const servers = [
    { id: 3, name: "EUW", disabled: false },
    { id: 1, name: "BR", disabled: false },
    { id: 2, name: "EUNE", disabled: false },
    { id: 4, name: "KR", disabled: false },
    { id: 5, name: "LA1", disabled: false },
    { id: 6, name: "LA2", disabled: false },
    { id: 7, name: "NA", disabled: false },
    { id: 8, name: "OC", disabled: false },
    { id: 9, name: "TR", disabled: false },
    { id: 10, name: "RU", disabled: false },
    { id: 11, name: "JP", disabled: false },
    { id: 12, name: "PBE", disabled: false },
];

const Home: NextPage = () => {
    const router = useRouter();
    const usernameRef = useRef<HTMLInputElement>(null);
    const [loading, setLoading] = useState(false);
    const [selectedServer, setSelectedServer] = useState(servers[0]);

    function onSubmit(e) {
        e.preventDefault();
        router.push(`/${selectedServer?.name}/${usernameRef.current?.value}/mastery`);
        console.log(`Redirecting to "/${selectedServer?.name}/${usernameRef.current?.value}/mastery..."`);
        setLoading(true);
    }

    return (
        <>
            <Head>
                <title>LoL Mastery Tracker</title>
                <meta property="og:title" content="LoL Mastery Tracker, brought to you by me!" key="title" />
                <meta
                    property="og:description"
                    content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
                />
                <meta property="og:image" content="https://lol.awot.dev/favicon.ico" />
                <link rel="icon" href="/favicon.ico" />
            </Head>
            <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
                <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
                    <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem] ">
                        Search{" "}
                        <div className="inline-block">
                            <MyListbox selectedServer={selectedServer} setSelectedServer={setSelectedServer} />
                        </div>{" "}
                        Summoner Profile
                    </h1>
                    <form className="grid grid-rows-1 gap-4 sm:grid-rows-2 md:gap-8" onSubmit={onSubmit}>
                        <input
                            type="text"
                            ref={usernameRef}
                            className="w-full rounded bg-gray-700 text-center text-xl text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
                        />

                        <button
                            type="submit"
                            className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
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
        </>
    );
};

export default Home;

const LoadingComponent = () => {
    return (
        <div className="justify-center content-center">
            <svg
                aria-hidden="true"
                role="status"
                className="inline w-5 h-5 text-gray-200 animate-spin dark:text-gray-400"
                viewBox="0 0 100 101"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
            >
                <path
                    d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z"
                    fill="currentColor"
                />
                <path
                    d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z"
                    fill="#cc66ff"
                />
            </svg>
        </div>
    );
};

function MyListbox({ selectedServer, setSelectedServer }) {
    return (
        <Listbox value={selectedServer} onChange={setSelectedServer}>
            <Listbox.Button className={"flex items-end"}>
                <span className="text-[hsl(280,100%,70%)]">{selectedServer?.name}</span>
                <p className="text-xs">v</p>
            </Listbox.Button>
            <div className="relative">
                <Listbox.Options className="absolute top-0 left-0 flex-col inline w-[150px]">
                    {servers.map((server) => {
                        if (selectedServer?.id === server.id) {
                            return (
                                <></>
                                // <Listbox.Option key={server.id} value={server} disabled={server.disabled}>
                                //   <span className="text-[hsl(280,100%,70%)]">{server.name}</span>
                                // </Listbox.Option>
                            );
                        } else {
                            return (
                                <Listbox.Option key={server.id} value={server} disabled={server.disabled}>
                                    <button type="button" className="hover:text-[hsl(280,100%,70%)]">
                                        {server.name}
                                    </button>
                                </Listbox.Option>
                            );
                        }
                    })}
                </Listbox.Options>
            </div>
        </Listbox>
    );
}
