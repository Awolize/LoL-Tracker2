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
        <title>
          LoL Mastery Tracker for {username} on {server}
        </title>
        <meta name="description" content="Generated using Riot API" />
        <meta property="og:image" content="/favicon.ico" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <User username={username} />
    </div>
  );
}
