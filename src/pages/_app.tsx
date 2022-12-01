import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { trpc } from "../utils/trpc";

import "../styles/globals.css";
import { createContext, useEffect, useState } from "react";
import { DATA_DRAGON_URL } from "../utils/constants";

const MyApp: AppType<{ session: Session | null }> = ({ Component, pageProps: { session, ...pageProps } }) => {
  const allChampions = trpc.riotApi.getChampions.useQuery();
  const [imageUrls, setImageUrls] = useState<string[]>([]);
  const [images, setImages] = useState<HTMLImageElement[]>([]);

  useEffect(() => {
    if (allChampions?.data) {
      const imageSrcs: string[] = [];
      for (const key in allChampions.data) {
        const champ = allChampions.data[key];
        if (!champ) continue;

        imageSrcs.push(champ.image.full);
      }
      setImageUrls(imageSrcs);
    }
  }, [allChampions?.data]);

  useEffect(() => {
    for (const imageUrl of imageUrls) {
      preloadImage(imageUrl);
    }
  }, [imageUrls]);

  function preloadImage(src: string) {
    return new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = function () {
        resolve(img);
      };
      img.onerror = img.onabort = function () {
        reject(src);
      };

      img.src = `${DATA_DRAGON_URL}${src}`;
      setImages((curr) => [...curr, img]);
    });
  }

  const ImageContext = createContext(images);

  return (
    <SessionProvider session={session}>
      <ImageContext.Provider value={images}>
        <Component {...pageProps} />
      </ImageContext.Provider>
    </SessionProvider>
  );
};

export default trpc.withTRPC(MyApp);
