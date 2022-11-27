import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";
import { ChampionMasteryDTO } from "twisted/dist/models-dto";
import User from "../../components/user";

interface ChampInfo {
  name: String;
  id: String;
  image: String;
  url: String;
}

export default function ProfilePage() {
  const router = useRouter();
  const { server, username } = router.query;
  console.log(router.query);

  return (
    <div>
      <User username={username} />
    </div>
  );
}
