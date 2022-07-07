import { useEffect, useState } from "react";
import * as Vibrant from "node-vibrant";
import fs from "fs";
import toast, { Toaster } from "react-hot-toast";
import Head from "next/head";

const DEFAULT_IMAGE = "https://picsum.photos/500/500";

export default function Home({ assets = [] }) {
  const [bgHex, setBgHex] = useState(null);
  const [bgChillHex, setBgChillHex] = useState(null);
  const [bgHSL, setBgHSL] = useState(null);
  const [bgChillHSL, setBgChillHSL] = useState(null);
  const [colorPalette, setPalette] = useState(null);
  const [query, setQuery] = useState(null);
  const [imgAddress, setImgAddress] = useState(DEFAULT_IMAGE);

  const notifyInvalidImageURL = () => toast.error("URL is not valid image");

  const getColorAccent = (e) => {
    e.persist();
    const src = e.target.src;

    Vibrant.from(src)
      .maxColorCount()
      .getSwatches()
      .then((palette) => {
        let hexColor = palette.Vibrant.getHex();
        let hslColor = palette.Vibrant.getHsl();
        let hslColorChill = [...hslColor];

        //make color chill
        hslColorChill[1] = hslColorChill[1] > 0.5 ? 0.8 : hslColorChill[1];
        hslColorChill[2] = 0.97;

        setBgChillHSL(hslColorChill);
        setBgHSL(hslColor);

        let rgbColor = Vibrant.Util.hslToRgb(...hslColorChill);
        let hexChillColor = Vibrant.Util.rgbToHex(...rgbColor);

        setBgHex(hexColor);
        setBgChillHex(hexChillColor);

        setPalette(palette);
      });
  };

  const onClickFetch = (e) => {
    if (query == "" || query == null) {
      window.location.reload();
    } else {
      setImgAddress(query);
    }
  };

  const onInputChange = (e) => {
    const value = e?.target?.value;
    setQuery(value);
  };

  const onImageError = (e) => {
    notifyInvalidImageURL();
    setQuery("");
    setImgAddress(DEFAULT_IMAGE);
  };

  const onFormSubmit = (e) => {
    e.preventDefault();
    onClickFetch();
  };

  return (
    <div className="grid max-w-screen max-h-screen p-32 gap-4 relative shrink-0">
      <Head>
        <title>Color extractor</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>"
        />
      </Head>
      <div className="grid grid-cols-3 gap-4 w-full">
        <div className="h-96 object-cover overflow-clip rounded-3xl relative">
          <form
            className="group z-40 absolute mx-4 mt-4 flex gap-2"
            onSubmit={onFormSubmit}
          >
            <input
              type="url"
              placeholder="Image url..."
              value={query}
              onChange={onInputChange}
              className="focus:ring-2 focus:ring-black/10 focus:outline-none w-full leading-6 text-black/80 placeholder-black/40 rounded-full py-3 px-4 ring-1 ring-gray-200 shadow-sm transition-colors ease-in bg-white/60 backdrop-blur-md"
            />
            <button
              type="button"
              onClick={onClickFetch}
              className="font-semibold h-12 text-sm bg-black px-6 text-white rounded-full hover:bg-gray-800"
            >
              Fetch
            </button>
          </form>
          <img
            className="flex w-full h-full"
            src={imgAddress}
            onLoad={getColorAccent}
            layout="fill"
            onError={onImageError}
          />
        </div>

        <div
          className="flex w-full h-96 relative rounded-3xl"
          style={{ backgroundColor: bgHex }}
        >
          <div className="bg-white shadow-sm p-4 left-4 bottom-4 absolute space-y-2 rounded-2xl font-mono">
            <h3 className="text-sm font-semibold capitalize">default</h3>
            <div className="grid gap-1 text-gray-500">
              {!!bgHSL &&
                bgHSL.map((key) => {
                  return <p className="text-sm">{key.toFixed(2)}</p>;
                })}
            </div>
          </div>
        </div>
        <div
          className="flex w-full h-96 relative rounded-3xl"
          style={{ backgroundColor: bgChillHex }}
        >
          <div className="bg-white shadow-sm p-4 left-4 bottom-4 absolute space-y-2 rounded-2xl font-mono">
            <h3 className="text-sm font-semibold capitalize">Chilled</h3>
            <div className="grid gap-1 text-gray-500">
              {!!bgChillHSL &&
                bgChillHSL.map((key) => {
                  return <p className="text-sm">{key.toFixed(2)}</p>;
                })}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-6 gap-4 w-full font-mono">
        {!!colorPalette && (
          <>
            {Object.keys(colorPalette).map((key, index) => {
              const paletteHex = colorPalette[key].getHex();
              const textColor = colorPalette[key].getTitleTextColor();
              return (
                <div
                  key={index}
                  className="palette h-40 w-auto flex-col flex items-center justify-center rounded-3xl text-sm font-medium"
                  style={{ background: paletteHex, color: textColor }}
                >
                  <p className="title">{key}</p>
                  <p>{paletteHex}</p>
                </div>
              );
            })}
          </>
        )}
      </div>
      <Toaster />
    </div>
  );
}

export const getStaticProps = async () => {
  const assetDirectory = "public/assets/";
  const assets = fs.readdirSync(assetDirectory);

  return {
    props: {
      assets: assets,
    },
  };
};
