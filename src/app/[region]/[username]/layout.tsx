import type { Metadata } from "next";

export async function generateMetadata({ params: { region, username } }): Promise<Metadata> {
    return {
        applicationName: "LoL Mastery Tracker",
        title: `LoL Mastery Tracker. ${username} Profile`,
        description:
            "Made using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/",
        keywords: [region, username, "LoL", "mastery", "tracker"],
    };
}

export default function RootLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return children;
}
