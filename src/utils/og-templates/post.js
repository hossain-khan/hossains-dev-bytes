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
          justifyContent: "space-between",
          backgroundColor: "#0f172a", // Fondo oscuro (Slate 900)
          color: "white",
          padding: "80px",
          position: "relative",
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

          // 4. Main content: Post title with accent line
          {
            type: "div",
            props: {
              style: {
                display: "flex",
                flexDirection: "column",
                width: "100%",
                gap: "24px",
              },
              children: {
                type: "h1",
                props: {
                  style: {
                    fontSize: 84,
                    fontWeight: 900,
                    lineHeight: 1.1,
                    margin: 0,
                    color: "#ffffff",
                    textShadow: "0 2px 10px rgba(0,0,0,0.3)",
                    overflow: "hidden",
                    display: "-webkit-box",
                    lineClamp: 3,
                    boxOrient: "vertical",
                  },
                  children: post.data.title,
                },
              },
            },
          },

          // 5. Footer: Tags
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
