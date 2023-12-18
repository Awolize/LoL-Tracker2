import "~/styles/globals.css";

import { cookies } from "next/headers";

import { TRPCReactProvider } from "~/trpc/react";
import { type Metadata } from "next";

export const metadata: Metadata = {
    applicationName: "LoL Mastery Tracker",
    title: "LoL Mastery Tracker, brought to you by me!",
    description:
        "Made using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/",
    icons: [{ rel: "icon", url: "/favicon.ico" }],
};

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <html lang="en">
            <body>
                <TRPCReactProvider cookies={cookies().toString()}>{children}</TRPCReactProvider>
            </body>
        </html>
    );
}
