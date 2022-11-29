import React from "react";
import { useRouter } from "next/router";
import User from "../../components/user";
import Head from "next/head";

export default function ProfilePage() {
  const router = useRouter();
  const { server, username } = router.query;
  console.log(router.query);

  return (
    <div>
      <Head>
        {/* <title>
          LoL Mastery Tracker for {username} on {server}
        </title> */}
        <meta
          property="og:title"
          content={`LoL Mastery Tracker for ${username} on ${server}.\nGenerated using Riot API`}
          key="title"
        />
        <meta
          property="og:description"
          content="Generated using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/"
        />
        <meta property="og:image" content="https://lol.awot.dev/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <User username={username as string} />
    </div>
  );
}
