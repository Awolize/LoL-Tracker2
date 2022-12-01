import React from "react";
import { useRouter } from "next/router";
import ChampsWrapper from "../../../components/champ_mastery/champs";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  console.log(router.query);

  return <ChampsWrapper username={username as string} />;
}
