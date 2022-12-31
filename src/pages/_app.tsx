import type { AppType } from "next/app";
// import type { Session } from "next-auth";
// import { SessionProvider } from "next-auth/react";
import { trpc } from "../utils/trpc";
import "../styles/globals.css";

const MyApp: AppType = ({ Component, pageProps: { ...pageProps } }) => {
  return (
    // <SessionProvider session={session}>
    <Component {...pageProps} />
    // </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
