import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";
import Link from "next/link";

export default function ProfilePage() {
  const router = useRouter();
  const { server, username } = router.query;

  return (
    <div>
      <Head>
        <title>
          LoL Mastery Tracker for {username} on {server}.
        </title>
        <meta
          property="og:title"
          content="LoL Mastery Tracker, brought to you by me!"
          key="title"
        />
        <meta
          property="og:description"
          content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
        />
        <meta property="og:image" content="https://lol.awot.dev/favicon.png" />
        <link rel="icon" href="/favicon.ico" />
      </Head>

      <div className="flex h-screen w-screen justify-center ">
        <ul className="flex flex-col text-xl">
          <span className="text-center">
            {server} {username}
          </span>
          <Link href={router.asPath + "/mastery"}>Mastery Points Tracker</Link>
          <Link href={router.asPath + "/mastery"}>todo</Link>
          <Link href={router.asPath + "/mastery"}>todo</Link>
          <Link href={router.asPath + "/mastery"}>todo</Link>
        </ul>
      </div>
    </div>
  );
}
