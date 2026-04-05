import satori from "satori";
import { SITE } from "@/config";
import loadGoogleFonts from "../loadGoogleFont";

export default async post => {
  return satori(
    {
      type: "div",
      props: {
        style: {
          height: "100%",
          width: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "flex-start",
          backgroundColor: "#0f172a", // Fondo oscuro (Slate 900)
          color: "white",
          padding: "80px",
          position: "relative",
          gap: "80px",
        },
        children: [
          // 1. Decorative background element (Painted first = stays in background)
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "-100px",
                right: "-100px",
                width: "600px",
                height: "600px",
                background: "linear-gradient(140deg, #6366f1, #a855f7)",
                filter: "blur(100px)",
                opacity: 0.4,
                borderRadius: "100%",
              },
            },
          },

          // 2. Header: Site name (Painted on top of background)
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                alignItems: "center",
                backgroundColor: "rgba(255, 255, 255, 0.1)",
                padding: "10px 24px",
                borderRadius: "50px",
                border: "1px solid rgba(255, 255, 255, 0.2)",
              },
              children: {
                type: "span",
                props: {
                  style: {
                    fontSize: 24,
                    fontWeight: "bold",
                    color: "#e2e8f0",
                    letterSpacing: "2px",
                  },
                  children: SITE.website.replace("https://", "").replace(/\/$/, ""),
                },
              },
            },
          },

          // 3. Gradient overlay behind title
          {
            type: "div",
            props: {
              style: {
                position: "absolute",
                top: "200px",
                left: "0px",
                width: "100%",
                height: "300px",
                background: "linear-gradient(90deg, rgba(99, 102, 241, 0.15), rgba(168, 85, 247, 0.1))",
                filter: "blur(60px)",
                pointerEvents: "none",
              },
            },
          },

          // 4. Watermark: Code icon on right edge as SVG
          {
            type: "svg",
            props: {
              style: {
                position: "absolute",
                right: "0px",
                top: "50%",
                transform: "translateY(-50%)",
                width: "500px",
                height: "500px",
                opacity: 0.07,
                overflow: "visible",
                pointerEvents: "none",
              },
              viewBox: "0 0 24 24",
              xmlns: "http://www.w3.org/2000/svg",
              children: [
                {
                  type: "path",
                  props: {
                    d: "m8.50226 5.38707c.30789-.2771.33284-.75131.05575-1.0592-.27709-.30788-.75131-.33284-1.05919-.05574l-1.73749 1.56374c-.73634.66266-1.34715 1.21235-1.76656 1.71092-.44103.52425-.75454 1.08751-.75454 1.78281s.31351 1.2586.75454 1.7828c.41941.4986 1.03021 1.0483 1.76655 1.7109l1.7375 1.5638c.30788.2771.7821.2521 1.05919-.0558s.25214-.7821-.05575-1.0592l-1.69647-1.5268c-.78787-.7091-1.31907-1.1895-1.66317-1.5985-.33025-.3926-.40239-.62178-.40239-.8172 0-.19543.07214-.42461.40239-.81719.3441-.40903.8753-.88943 1.66317-1.59852z",
                    fill: "#cbd5e1",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "m15.443 10.4983c.2771-.3079.7513-.3329 1.0592-.0558l1.7375 1.5638c.7363.6626 1.3471 1.2123 1.7666 1.7109.441.5243.7545 1.0875.7545 1.7828s-.3135 1.2586-.7545 1.7828c-.4195.4986-1.0303 1.0483-1.7666 1.7109l-1.7375 1.5638c-.3079.2771-.7821.2521-1.0592-.0558s-.2521-.7821.0558-1.0592l1.6964-1.5268c.7879-.7091 1.3191-1.1895 1.6632-1.5985.3303-.3926.4024-.6218.4024-.8172s-.0721-.4246-.4024-.8172c-.3441-.409-.8753-.8894-1.6632-1.5985l-1.6964-1.5268c-.3079-.2771-.3329-.7513-.0558-1.0592z",
                    fill: "#cbd5e1",
                  },
                },
                {
                  type: "path",
                  props: {
                    d: "m14.1797 4.27511c.4003.1064.6385.51717.5321.91748l-3.9868 15.00001c-.1064.4003-.5172.6386-.91747.5322-.40031-.1064-.63858-.5172-.53218-.9175l3.98685-15.00001c.1064-.40032.5171-.63858.9175-.53218z",
                    fill: "#cbd5e1",
                    opacity: 0.5,
                  },
                },
              ],
            },
          },

          // 5. Main content: Post title
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "32px",
              },
              children: {
                type: "h1",
                props: {
                  style: {
                    fontSize: post.data.title.length > 100 ? 48 : post.data.title.length > 80 ? 60 : 72,
                    fontWeight: 900,
                    lineHeight: 1.15,
                    margin: 0,
                    color: "#ffffff",
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "-webkit-box",
                    lineClamp: post.data.title.length > 80 ? 2 : 3,
                    boxOrient: "vertical",
                  },
                  children: post.data.title,
                },
              },
            },
          },

          // 6. Footer: Tags
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                gap: "12px",
                alignItems: "center",
              },
              children: (post.data.tags || []).slice(0, 2).map(tag => ({
                type: "div",
                props: {
                  style: {
                    backgroundColor: "#1e293b",
                    color: "#cbd5e1",
                    padding: "8px 16px",
                    borderRadius: "20px",
                    fontSize: 20,
                    fontWeight: 600,
                    letterSpacing: "0.5px",
                  },
                  children: tag,
                },
              })),
            },
          },
        ],
      },
    },
    {
      width: 1200,
      height: 630,
      embedFont: true,
      fonts: await loadGoogleFonts(
        post.data.title + (post.data.tags || []).slice(0, 2).join(" ") + SITE.website.replace("https://", "").replace(/\/$/, "")
      ),
    }
  );
};
