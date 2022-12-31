// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
!process.env.SKIP_ENV_VALIDATION && (await import("./src/env/server.mjs"));

/** @type {import("next").NextConfig} */
const config = {
  reactStrictMode: true,
  swcMinify: true,
  i18n: {
    locales: ["en"],
    defaultLocale: "en",
  },
  images: {
    domains: ["ddragon.leagueoflegends.com"],
  },
};

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: true,
// });
// module.exports = withBundleAnalyzer(config);

export default config;
