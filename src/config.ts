export const SITE = {
  website: "https://hossains-dev-bytes.hk-c91.workers.dev/",
  author: "Hossain Khan",
  profile: "https://hossainkhan.com/",
  desc: "Thoughts and dev bytes",
  title: "Hossain's Dev Bytes",
  ogImage: "devosfera-og.webp", // located in public folder
  lightAndDarkMode: true,
  postPerIndex: 6,
  postPerPage: 8,
  scheduledPostMargin: 15 * 60 * 1000, // 15 minutes
  showArchives: true,
  showGalleries: true,
  showGalleriesInIndex: true, // Show galleries in the general paginated list
  showBackButton: true, // show back button in post detail
  backdropEffects: {
    cursorGlow: true, // cursor tracking with soft halo
    grain: true, // background visual noise layer
  },
  editPost: {
    enabled: false,
    text: "Edit Post",
    url: "https://github.com/hossain-khan/hossains-dev-bytes/edit/main/",
  },
  dynamicOgImage: true,
  dir: "ltr", // "rtl" | "auto"
  lang: "en", // html lang code. Set this empty and default will be "en"
  timezone: "America/Toronto", // Default global timezone (IANA format) https://en.wikipedia.org/wiki/List_of_tz_database_time_zones
  introAudio: {
    enabled: false, // show/hide the hero audio player
    src: "/audio/intro-web.mp3", // audio file path (relative to /public)
    label: "INTRO.MP3", // display label in the player
    duration: 30, // duration in seconds (for the fixed progress bar)
  },
} as const;
