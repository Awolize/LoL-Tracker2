import path from "node:path";
import { type NextRequest, NextResponse } from "next/server";
import sharp from "sharp";
import { minio } from "~/server/minio";

export async function GET(req: NextRequest, props: { params: Promise<{ slugs: string[] }> }) {	
	const params = await props.params;
	const { slugs } = params;
	const imageName = slugs.join("/");
	const bucketName = "images";

	try {
		const objectStream = await minio.getObject(bucketName, imageName);
		const imageBuffer = await streamToBuffer(objectStream);
		const ext = path.extname(imageName).slice(1);
		const contentType = `image/${ext === "jpg" ? "jpeg" : ext}`;

		return new NextResponse(imageBuffer, {
			headers: {
				"Content-Type": contentType,
				"Cache-Control": "public, max-age=31536000, immutable",
			},
		});
	} catch (error) {
		try {
			const thirdPartyImageUrl = `https://ddragon.leagueoflegends.com/${imageName}`;
			const response = await fetch(thirdPartyImageUrl);
			if (!response.ok) {
				throw new Error("Network response was not ok");
			}
			const arrayBuffer = await response.arrayBuffer();
			const imageBuffer = Buffer.from(arrayBuffer);

			// Optimize the image using sharp
			const optimizedImageBuffer = await sharp(imageBuffer)
				.toFormat("webp") // Convert to WebP format
				.toBuffer();

			await minio.putObject(bucketName, imageName, optimizedImageBuffer, optimizedImageBuffer.length);
			return new NextResponse(optimizedImageBuffer, {
				headers: {
					"Content-Type": "image/webp",
					"Cache-Control": "public, max-age=31536000, immutable",
				},
			});
		} catch (error) {
			return new NextResponse("Image not found", { status: 404 });
		}
	}
}

// Helper function to convert stream to buffer
const streamToBuffer = (stream: NodeJS.ReadableStream): Promise<Buffer> => {
	return new Promise((resolve, reject) => {
		const chunks: Uint8Array[] = [];
		stream.on("data", (chunk) => chunks.push(chunk));
		stream.on("end", () => resolve(Buffer.concat(chunks)));
		stream.on("error", (err) => reject(err));
	});
};
