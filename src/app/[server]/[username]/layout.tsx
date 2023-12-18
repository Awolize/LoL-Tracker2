export async function generateMetadata({ params: { server, username } }) {
    return {
        title: `LoL Mastery Tracker. ${username} Profile`,
        description:
            "Made using Riot API. Repo can be found using https://github.com/Awolize. Boilerplate was generated using https://create.t3.gg/",
        keywords: [server, username, "LoL", "mastery", "tracker"],
    };
}
