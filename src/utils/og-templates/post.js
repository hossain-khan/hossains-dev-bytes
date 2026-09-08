/**
 * Post Open Graph Image Generator
 *
 * Generates dynamic 1200x630px OG images for blog posts using Satori + Resvg.
 * Uses a custom background image with a defined safe drawing area for the title.
 *
 * Background image native size: 1678x937
 * Safe drawing area (native coords):
 *   Top-Left:     (390,  55)
 *   Bottom-Right: (1260, 537)
 *
 * Scaled to 1200x630 output (scale X=1200/1678~=0.715, scale Y=630/937~=0.672):
 *   x: 287  y: 45  width: 606  height: 308
 *
 * Font: Jersey 10 (Google Fonts) - dynamic size to fill safe area.
 */

import satori from "satori";
import loadGoogleFonts from "../loadGoogleFont";
import fs from "node:fs";
import path from "node:path";

// Safe drawing area at 1200x630 output size
// (scaled from native 1678x937 coordinates: TL=390,55 BR=1260,537)
const MARGIN = 8; // small margin to prevent text from touching edges
const SAFE_X = Math.round(390 * (1200 / 1678)) + MARGIN; // 287
const SAFE_Y = Math.round(55 * (630 / 937)) + MARGIN; // 45
const SAFE_W = Math.round((1260 - 390) * (1200 / 1678)) - MARGIN * 2; // 606
const SAFE_H = Math.round((537 - 55) * (630 / 937)) - MARGIN * 2; // 308
const LINE_HEIGHT = 1.15;

// Sticky note display area at 1200x630 output size
// (scaled from native 1678x937 coordinates: TL=122,104 BR=316,206)
const TAG_MARGIN = 2;
const TAG_X = Math.round(122 * (1200 / 1678)) + TAG_MARGIN; // 89
const TAG_Y = Math.round(104 * (630 / 937)) + TAG_MARGIN; // 72
const TAG_W = Math.round((316 - 122) * (1200 / 1678)) - TAG_MARGIN * 2; // 135
const TAG_H = Math.round((206 - 104) * (630 / 937)) - TAG_MARGIN * 2; // 65
/**
 * Estimate appropriate font size so the longest tag fits on one line within the sticky note width.
 * Uses Jersey 10 char-width heuristic: avg char ~= 0.55 x fontSize.
 */
function getTagFontSize(tags) {
  const longest = Math.max(...tags.map(t => t.length));
  for (const size of [34, 30, 26, 22, 18]) {
    if (longest * size * 0.45 <= TAG_W) {
      return size;
    }
  }
  return 16; // fallback
}

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
    "src/assets/images/open-graph-base-background-refined.png"
  );
  const bgBase64 = `data:image/png;base64,${fs.readFileSync(bgPath).toString("base64")}`;

  const title = post.data.title;
  const fontSize = getTitleFontSize(title);
  const lineClamp = Math.floor(SAFE_H / (fontSize * LINE_HEIGHT));
  const tags = (post.data.tags ?? []).slice(0, 2).map(t => `#${t}`);
  const tagFontSize = tags.length > 0 ? getTagFontSize(tags) : 20;
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

          // Tags rendered inside the sticky note area (up to 2 tags)
          ...(tags.length > 0
            ? [
                {
                  type: "div",
                  props: {
                    style: {
                      position: "absolute",
                      left: `${TAG_X}px`,
                      top: `${TAG_Y}px`,
                      width: `${TAG_W}px`,
                      height: `${TAG_H}px`,
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "flex-start",
                      justifyContent: "center",
                      overflow: "hidden",
                      gap: "2px",
                    },
                    children: tags.map(tag => ({
                      type: "span",
                      props: {
                        style: {
                          fontSize: tagFontSize,
                          fontFamily: "Jersey 10",
                          fontWeight: 400,
                          color: "#4a4a4a",
                          lineHeight: 1.2,
                          overflow: "hidden",
                          whiteSpace: "nowrap",
                        },
                        children: tag,
                      },
                    })),
                  },
                },
              ]
            : []),
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(title + " " + tags.join(" ")),
    }
  );
};
