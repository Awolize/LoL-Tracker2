import React from "react";
import { useRouter } from "next/router";
import User from "../../components/user";

export default function ProfilePage() {
  const router = useRouter();
  const { username } = router.query;
  console.log(router.query);

  return (
    <div>
      <User username={username} />
    </div>
  );
}
