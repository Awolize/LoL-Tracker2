import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: "*",
                allow: "/",
            },
            {
                userAgent: "*",
                allow: "/search",
            },
            {
                userAgent: "*",
                allow: "/EUW/awot-dev/",
            },
            {
                userAgent: "*",
                allow: "/EUW/awot-dev/mastery",
            },
            {
                userAgent: "*",
                allow: "/EUW/awot-dev/different",
            },
        ],
        sitemap: [
            "https://lol.awot.dev/sitemap.xml",
            "https://lol.awot.dev/sitemap1.xml",
            "https://lol.awot.dev/sitemap2.xml",
            "https://lol.awot.dev/sitemap3.xml",
            "https://lol.awot.dev/sitemap4.xml",
        ],
    };
}
