import { useEffect, useState } from 'react';
import * as Vibrant from "node-vibrant";

export default function Home() {
  const [bg, setBg] = useState(null);
  const [bgChill, setBgChill] = useState(null);
  const [colorPalette, setPalette] = useState(null);

  const publicImageSrc = "/assets/tinyfaces.png"

  useEffect(() => {
    Vibrant.from(publicImageSrc, {})
      .maxColorCount(3)
      .getPalette()
      .then(palette => {
        let hexColor = palette.LightVibrant.getHex()
        let hslColor = palette.LightVibrant.getHsl()
        console.log(hslColor);

        //make color chill
        hslColor[1] = 0.90
        hslColor[2] = 0.97
        let rgbColor = Vibrant.Util.hslToRgb(...hslColor)
        let hexChillColor = Vibrant.Util.rgbToHex(...rgbColor)

        setBg(hexColor)
        setBgChill(hexChillColor)
        setPalette(palette)
      });
  }, [])

  return (
    <div className="grid max-w-screen max-h-screen p-32 gap-8">

      <div className='flex items-center justify-center gap-8'>
        <img
          className="flex-none w-96 h-96 object-cover overflow-clip rounded-3xl"
          src={publicImageSrc}
          alt="igm"
        />
        <div className='flex w-full h-96 items-center justify-center rounded-3xl' style={{backgroundColor: bg}}>
          <p>default</p>
        </div>
        <div className='flex w-full h-96 items-center justify-center rounded-3xl' style={{backgroundColor: bgChill}}>
          <p>Chill</p>
        </div>
      </div>

      <div className='grid grid-cols-6 gap-8 w-full'>
      {!!colorPalette && (
          <>
            {Object.keys(colorPalette).map((key, index) => {
              const paletteHex = colorPalette[key].getHex();
              const textColor = colorPalette[key].getTitleTextColor();
              return (
                <div
                  key={index}
                  className="palette h-40 w-auto flex-col flex items-center justify-center rounded-3xl"
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
    </div>
  )
}
