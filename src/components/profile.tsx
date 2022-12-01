import React from "react";
import { useRouter } from "next/router";
import Head from "next/head";

export default function ProfilePage() {
  const router = useRouter();
  const { server, username } = router.query;
  console.log(router.query);

  return (
    <div>
      <p>Profile</p>
    </div>
  );
}
