// @ts-check
/**
 * Run `build` or `dev` with `SKIP_ENV_VALIDATION` to skip env validation.
 * This is especially useful for Docker builds.
 */
await import("./src/env.js");

/** @type {import("next").NextConfig} */
const config = {
	reactStrictMode: true,
	swcMinify: true,
	i18n: {
		locales: ["en"],
		defaultLocale: "en",
	},
	images: {
		unoptimized: true,
		domains: ["ddragon.leagueoflegends.com"],
		remotePatterns: [
			{
				protocol: "https",
				hostname: "ddragon.leagueoflegends.com",
				port: "",
				pathname: "cdn/**",
			},
		],
	},
	output: "standalone",
	headers: async () => {
		return [
			{
				// matching all API routes
				source: "/api/:path*",
				headers: [
					{ key: "Access-Control-Allow-Credentials", value: "true" },
					{ key: "Access-Control-Allow-Origin", value: "*" },
					{
						key: "Access-Control-Allow-Methods",
						value: "GET,OPTIONS,PATCH,DELETE,POST,PUT",
					},
					{
						key: "Access-Control-Allow-Headers",
						value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version",
					},
				],
			},
		];
	},
	eslint: {
		// Warning: This allows production builds to successfully complete even if
		// your project has ESLint errors.
		ignoreDuringBuilds: true,
	},
};

// // eslint-disable-next-line @typescript-eslint/no-var-requires
// const withBundleAnalyzer = require("@next/bundle-analyzer")({
//   enabled: true,
// });
// module.exports = withBundleAnalyzer(config);

export default config;
