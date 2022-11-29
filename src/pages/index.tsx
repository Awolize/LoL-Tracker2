import { type NextPage } from "next";
import Head from "next/head";
import { useRouter } from "next/router";
import { useRef } from "react";

const Home: NextPage = () => {
  const router = useRouter();
  const usernameRef = useRef<HTMLInputElement>(null);

  function onSubmit(e) {
    e.preventDefault();
    router.push(`/EUW/${usernameRef.current?.value}`);
  }

  return (
    <>
      <Head>
        <title>LoL Mastery Tracker</title>
        <meta
          property="og:title"
          content="LoL Mastery Tracker, brought to you by me!"
          key="title"
        />
        <meta
          property="og:description"
          content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
        />
        <meta property="og:image" content="https://lol.awot.dev/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-[#2e026d] to-[#15162c]">
        <div className="container flex flex-col items-center justify-center gap-12 px-4 py-16 ">
          <h1 className="text-2xl font-extrabold tracking-tight text-white sm:text-[2rem]">
            Search <span className="text-[hsl(280,100%,70%)]">EU West</span>{" "}
            Summoner Profiles
          </h1>
          <form
            className="grid grid-rows-1 gap-4 sm:grid-rows-2 md:gap-8"
            onSubmit={onSubmit}
          >
            <input
              type="text"
              ref={usernameRef}
              className="w-full rounded bg-gray-700 text-center text-xl text-white placeholder-gray-400 focus:border-sky-500 focus:outline-none focus:ring-1 focus:ring-gray-500"
            />

            <button
              type="submit"
              className="flex max-w-xs flex-col gap-4 rounded-xl bg-white/10 p-4 text-white hover:bg-white/20"
            >
              <h3 className="justify-center text-center font-bold">Look up</h3>
            </button>
          </form>
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl text-white">
              {/* {hello.data ? hello.data.greeting : "Loading tRPC query..."} */}
            </p>
          </div>
        </div>
      </main>
    </>
  );
};

export default Home;
