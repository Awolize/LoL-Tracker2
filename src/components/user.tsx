import React, { useEffect } from "react";
import { trpc } from "../utils/trpc";
import Champs from "./champs";

const User = ({ username }: any) => {
  const { data, isFetched, refetch } = trpc.riotApi.getUserByName.useQuery(
    {
      username: username,
    },
    {
      enabled: false,
    }
  );

  useEffect(() => {
    if (typeof username == "string") {
      console.log("username:", username);
      console.log("FETCHING USER INFO BY NAME");
      refetch();
    }
  }, [username]);

  if (isFetched && data?.id) {
    return <Champs userId={data?.id} />;
  } else {
    return (
      <main>Welcome {username} getting your user info information...</main>
    );
  }
};

export default User;
