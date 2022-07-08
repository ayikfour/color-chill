import { useEffect, useState } from "react";
import * as Vibrant from "node-vibrant";
import toast, { Toaster } from "react-hot-toast";
import Head from "next/head";

// URL for getting random images to strest test
const DEFAULT_IMAGE = "https://picsum.photos/500/500";
const HSL_KEY = ["H", "S", "L"];

export default function Home() {
  // Hex color
  const [bgHex, setBgHex] = useState(null);

  // Hex color but with tweaked HSL value. To make it more pastel-ish
  const [bgChillHex, setBgChillHex] = useState(null);

  // We keep the HSL value here. Because we need HSL format to be able to adjust it
  const [bgHSL, setBgHSL] = useState(null);
  const [bgChillHSL, setBgChillHSL] = useState(null);

  // Ignore this. This state is for querying image address.
  const [query, setQuery] = useState(null);
  const [imgAddress, setImgAddress] = useState(DEFAULT_IMAGE);

  // Colors are used to store generated chilled color palette.
  const [colors, setColors] = useState(new Array());

  // Toast notification hook
  const notifyInvalidImageURL = () => toast.error("URL is not valid image");

  // Event handler to extract vibrant colors from the image
  // -> then transform it into pastel-ish color palette
  const getColorAccent = (e) => {
    e.persist();
    const src = e.target.src;

    // Initiate Vibrant package to extract the color
    Vibrant.from(src)
      .maxDimension(50)
      .maxColorCount(64)
      .getSwatches()
      .then((palette) => {
        let hexColor = palette.Vibrant.getHex();
        let hslColor = palette.Vibrant.getHsl();
        let hslColorChill = [...hslColor];

        //Secret sauce –> make color chill
        // Adjust "Saturation" to 80%/0.8
        hslColorChill[1] = 0.8;
        // Adjust "Luminance" to 97%/0.97
        hslColorChill[2] = 0.97;

        // Save chilled HSL color to state
        setBgChillHSL(hslColorChill);
        setBgHSL(hslColor);

        // Cast Chilled HSL color into RGB type
        let rgbColor = Vibrant.Util.hslToRgb(...hslColorChill);
        // Cast RBG into HEX type
        // This is kinda back-and-forth process.
        // The library doesn't have converter from HSL -> HEX. Thats why we need to cast into RGB first
        let hexChillColor = Vibrant.Util.rgbToHex(...rgbColor);

        // Save chilled HEX color to state
        setBgHex(hexColor);
        setBgChillHex(hexChillColor);

        // Update the chilled color palette state
        setColors([...colors, hexChillColor]);

        // Save chilled color palette to local storage
        window.localStorage.setItem(
          "color-palette",
          JSON.stringify([...colors, hexChillColor])
        );
      });
  };

  /**
   * Hook for initializing local storages
   * Local storage used for saving chilled color palettes
   */
  useEffect(() => {
    // Check if window already loaded
    if (typeof window !== "undefined") {
      // Get array from local storage
      let colorsLocalStorage = JSON.parse(
        window.localStorage.getItem("color-palette")
      );

      // If local storage is available
      // -> Copy local storage value to the state
      if (Array.isArray(colorsLocalStorage)) {
        setColors([...colorsLocalStorage]);
      } else {
        // Else, if the local storage is empty
        // -> initialize the local storage with current state
        window.localStorage.setItem(
          "color-palette",
          JSON.stringify([...colors])
        );
      }
    }
  }, []);

  // Fetch button event handler
  const onClickFetch = (e) => {
    // if query is empty or null, reload the page to fetch new image
    if (query == "" || query == null) {
      window.location.reload();
    } else {
      // else, set image address with new URL query
      setImgAddress(query);
    }
  };

  // Input value change handler
  const onInputChange = (e) => {
    const value = e?.target?.value;
    setQuery(value);
  };

  // On image error handler
  // This is for handling case if the URL is invalid
  const onImageError = (e) => {
    // Trigger error toast
    notifyInvalidImageURL();
    setQuery("");
    setImgAddress(DEFAULT_IMAGE);
  };

  // Handle if the URL input is submitted
  const onFormSubmit = (e) => {
    e.preventDefault();
    onClickFetch();
  };

  return (
    <div className="flex-col flex w-screen min-h-screen p-24 space-y-4 lg:justify-center">
      <Head>
        <title>Color extractor</title>
        <link
          rel="icon"
          href="data:image/svg+xml,<svg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22><text y=%22.9em%22 font-size=%2290%22>🔥</text></svg>"
        />
      </Head>

      <div className="grid lg:grid-cols-3 gap-4 w-full">
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
              {query == "" || !query ? "Reload" : "Fetch"}
            </button>
          </form>
        </div>

        <div
          className="flex w-full h-96 relative rounded-3xl"
          style={{ backgroundColor: bgHex }}
        >
          <div className="bg-white/30 p-4 left-4 bottom-4 absolute space-y-1 rounded-xl font-mono text-black">
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
          <div className="bg-white p-4 left-4 bottom-4 absolute space-y-2 rounded-xl font-mono text-black">
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
      <div className="grid grid-cols-6 gap-4 w-full font-mono">
        {colors.length > 0 &&
          colors.map((color) => {
            return (
              <div
                className="palette h-40 w-auto flex-col flex items-center justify-center rounded-3xl text-sm font-medium"
                style={{ backgroundColor: color }}
              >
                <p>{color}</p>
              </div>
            );
          })}
      </div>
      <Toaster />
    </div>
  );
}
