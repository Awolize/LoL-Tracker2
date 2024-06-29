import { Client } from "minio";
import { env } from "~/env";

const globalForMinio = globalThis as unknown as {
	minio: Client | undefined;
};

export const minio =
	globalForMinio.minio ??
	new Client({
		endPoint: env.MINIO_ENDPOINT,
		port: Number.parseInt(env.MINIO_PORT, 10),
		useSSL: false,
		accessKey: env.MINIO_ACCESS_KEY,
		secretKey: env.MINIO_SECRET_KEY,
	});

if (env.NODE_ENV !== "production") {
	globalForMinio.minio = minio;
}
