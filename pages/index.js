import { useState } from "react";
import * as Vibrant from "node-vibrant";
import toast, { Toaster } from "react-hot-toast";
import Head from "next/head";

const DEFAULT_IMAGE = "https://picsum.photos/500/500";
const HSL_KEY = ["H", "S", "L"];

export default function Home() {
  const [bgHex, setBgHex] = useState(null);
  const [bgChillHex, setBgChillHex] = useState(null);
  const [bgHSL, setBgHSL] = useState(null);
  const [bgChillHSL, setBgChillHSL] = useState(null);
  const [colorPalette, setPalette] = useState(null);
  const [isPaletteShown, togglePalette] = useState(false);
  const [query, setQuery] = useState(null);
  const [imgAddress, setImgAddress] = useState(DEFAULT_IMAGE);

  const notifyInvalidImageURL = () => toast.error("URL is not valid image");

  const getColorAccent = (e) => {
    e.persist();
    const src = e.target.src;

    Vibrant.from(src)
      .maxColorCount(120)
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

  const onClickToggleDetail = (e) => {
    togglePalette((v) => !v);
  };

  return (
    <div className="flex-col flex w-screen h-screen gap-4 p-24 space-y-4 justify-center">
      <Head>
        <title>Color extractor</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>"
        />
      </Head>

      <div className="grid grid-cols-3 grid-flow-col gap-4 w-full">
        <div className="h-96 object-cover overflow-clip rounded-3xl relative items-end flex">
          <img
            className="w-full h-full absolute object-cover"
            src={imgAddress}
            onLoad={getColorAccent}
            onError={onImageError}
          />
          <form
            className="group mx-6 mb-6 w-full flex gap-2"
            onSubmit={onFormSubmit}
          >
            <input
              type="url"
              placeholder="Image url..."
              value={query}
              onChange={onInputChange}
              className="z-40 focus:ring-2 focus:ring-black/10 focus:outline-none flex-1 leading-6 text-black/80 placeholder-black/40 rounded-full py-3 px-4 ring-1 ring-gray-200 shadow-sm transition-colors ease-in bg-white/60 backdrop-blur-md"
            />
            <button
              type="button"
              onClick={onClickFetch}
              className="z-40 font-semibold h-12 text-sm bg-black px-6 text-white rounded-full hover:bg-gray-800 active:scale-95 transition-all ease-in-out"
            >
              Fetch
            </button>
          </form>
        </div>

        <div
          className="flex w-full h-96 relative rounded-3xl"
          style={{ backgroundColor: bgHex }}
        >
          <div
            className="bg-white/30 p-4 left-4 bottom-4 absolute space-y-1 rounded-xl font-mono"
            style={{
              color: colorPalette
                ? colorPalette[0]?.getTitleTextColor()
                : "#000",
            }}
          >
            <h3 className="text-sm capitalize">default</h3>
            <div className="grid grid-flow-col gap-3">
              {!!bgHSL &&
                bgHSL.map((key, index) => {
                  return (
                    <p className="text-sm">
                      {HSL_KEY[index]}:{key.toFixed(2)}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>

        <div
          className="flex w-full h-96 relative rounded-3xl"
          style={{ backgroundColor: bgChillHex }}
        >
          <div
            className="bg-white p-4 left-4 bottom-4 absolute space-y-2 rounded-xl font-mono"
            style={{
              color: colorPalette
                ? colorPalette[0]?.getTitleTextColor()
                : "#000",
            }}
          >
            <h3 className="text-sm capitalize">Chilled</h3>
            <div className="grid grid-flow-col gap-3">
              {!!bgHSL &&
                bgChillHSL.map((key, index) => {
                  return (
                    <p className="text-sm">
                      {HSL_KEY[index]}:{key.toFixed(2)}
                    </p>
                  );
                })}
            </div>
          </div>
        </div>
      </div>

      {!!colorPalette && isPaletteShown && (
        <div className="grid grid-cols-6 gap-4 w-full font-mono">
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
        </div>
      )}

      <Toaster />
    </div>
  );
}
