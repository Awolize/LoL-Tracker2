import type { AppType } from "next/app";

import "../styles/globals.css";
import { api, processingApi } from "../utils/api";

const MyApp: AppType = ({ Component, pageProps }) => {
    return <Component {...pageProps} />;
};

export default api.withTRPC(processingApi.withTRPC(MyApp));
