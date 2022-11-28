import React from "react";
import { useRouter } from "next/router";
import User from "../../components/user";
import Head from "next/head";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  console.log(router.query);

  return (
    <div>
      <Head>
        <title>LoL Mastery Tracker</title>
        <meta name="description" content="Generated using Riot API" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <User username={username} />
    </div>
  );
}
