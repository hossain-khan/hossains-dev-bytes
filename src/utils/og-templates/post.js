/**
 * Post Open Graph Image Generator
 *
 * Generates dynamic 1200x630px OG images for blog posts using Satori + Resvg.
 * Uses a custom background image with a defined safe drawing area for the title.
 *
 * Background image native size: 2752x1536
 * Safe drawing area (native coords):
 *   Top-Left:     (640,  90)
 *   Bottom-Right: (2070, 880)
 *
 * Scaled to 1200x630 output (scale X=1200/2752~=0.436, scale Y=630/1536~=0.410):
 *   x: 279  y: 37  width: 623  height: 324
 *
 * Font: Jersey 10 (Google Fonts) - dynamic size to fill safe area.
 */

import satori from "satori";
import loadGoogleFonts from "../loadGoogleFont";
import fs from "node:fs";
import path from "node:path";

// Safe drawing area at 1200x630 output size
// (scaled from native 2752x1536 coordinates: TL=640,90 BR=2070,880)
const MARGIN = 8; // small margin to prevent text from touching edges
const SAFE_X = Math.round(640 * (1200 / 2752)) + MARGIN;   // 281
const SAFE_Y = Math.round(90 * (630 / 1536)) + MARGIN;     // 39
const SAFE_W = Math.round((2070 - 640) * (1200 / 2752)) - MARGIN * 2; // 620
const SAFE_H = Math.round((880 - 90) * (630 / 1536)) - MARGIN * 2;   // 320
const LINE_HEIGHT = 1.15;

/**
 * Estimate appropriate font size so the title fits within the safe area.
 * Uses Jersey 10 char-width heuristic: avg char ~= 0.55 x fontSize.
 */
function getTitleFontSize(title) {
  const len = title.length;
  for (const size of [80, 64, 52, 44, 36, 30]) {
    const charsPerLine = Math.floor(SAFE_W / (size * 0.55));
    const linesAvailable = Math.floor(SAFE_H / (size * LINE_HEIGHT));
    if (Math.ceil(len / charsPerLine) <= linesAvailable) {
      return size;
    }
  }
  return 24; // fallback for very long titles
}

export default async post => {
  const bgPath = path.join(
    process.cwd(),
    "src/assets/images/open-graph-base-background.png"
  );
  const bgBase64 = `data:image/png;base64,${fs.readFileSync(bgPath).toString("base64")}`;

  const title = post.data.title;
  const fontSize = getTitleFontSize(title);
  const lineClamp = Math.floor(SAFE_H / (fontSize * LINE_HEIGHT));

  return satori(
    {
      type: "div",
      props: {
        style: {
          position: "relative",
          width: "100%",
          height: "100%",
          display: "flex",
        },
        children: [
          // Background image stretched to fill the full canvas
          {
            type: "img",
            props: {
              src: bgBase64,
              style: {
                position: "absolute",
                top: 0,
                left: 0,
                width: "1200px",
                height: "630px",
              },
            },
          },

          // Title text positioned inside the safe drawing area
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                left: `${SAFE_X}px`,
                top: `${SAFE_Y}px`,
                width: `${SAFE_W}px`,
                height: `${SAFE_H}px`,
                display: "flex",
                alignItems: "flex-start",
                justifyContent: "flex-start",
                overflow: "hidden",
              },
              children: {
                type: "span",
                props: {
                  style: {
                    fontSize,
                    fontFamily: "Jersey 10",
                    fontWeight: 400,
                    color: "#ffffff",
                    lineHeight: LINE_HEIGHT,
                    overflow: "hidden",
                    display: "-webkit-box",
                    lineClamp,
                    boxOrient: "vertical",
                  },
                  children: title,
                },
              },
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(title),
    }
  );
};
