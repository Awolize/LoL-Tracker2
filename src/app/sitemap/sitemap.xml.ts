const URL = "https://lol.awot.dev";

function generateSiteMap() {
    return `<?xml version="1.0" encoding="UTF-8"?>
    <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
      <sitemap>
        <loc>${URL}/sitemap1.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${URL}/sitemap2.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${URL}/sitemap3.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${URL}/sitemap4.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${URL}/sitemap5.xml</loc>
      </sitemap>
      <sitemap>
        <loc>${URL}/sitemap6.xml</loc>
      </sitemap>
    </sitemapindex>
 `;
}

export async function getServerSideProps({ res }) {
    // Generate the XML sitemap with the blog data
    const sitemap = generateSiteMap();

    res.setHeader("Content-Type", "text/xml");
    // Send the XML to the browser
    res.write(sitemap);
    res.end();

    return {
        props: {},
    };
}

export default function SiteMap() {}
