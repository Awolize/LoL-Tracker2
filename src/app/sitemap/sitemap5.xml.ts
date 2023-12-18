import { PrismaClient, type Summoner } from "@prisma/client";

const URL = "https://lol.awot.dev";

function generateSiteMap(summoners: Summoner[]) {
    return `<?xml version="1.0" encoding="UTF-8"?>
   <urlset xmlns="https://www.sitemaps.org/schemas/sitemap/0.9">
     <!-- Add the static URLs manually -->
     ${summoners
         .filter((e) => e.gameName && e.tagLine)
         .map(({ gameName, tagLine }) => {
             return `
           <url>
               <loc>${`${URL}/EUW/${gameName}-${tagLine}`}</loc>
           </url>
           <url>
               <loc>${`${URL}/EUW/${gameName}-${tagLine}/mastery`}</loc>
           </url>
         `;
         })
         .join("")}
   </urlset>
 `;
}

async function getSortedData() {
    const prisma = new PrismaClient();
    const summoners = await prisma.summoner.findMany({ skip: 50000 * 2, take: 10000 });
    return summoners;
}

export async function getServerSideProps({ res }) {
    const summoners = await getSortedData();

    // Generate the XML sitemap with the blog data
    const sitemap = generateSiteMap(summoners);

    res.setHeader("Content-Type", "text/xml");
    // Send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}

export default function SiteMap() {}
