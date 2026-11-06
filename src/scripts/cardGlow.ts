/**
 * cardGlow.ts
 *
 * Tracks mouse coordinates across `.card-glow` elements to dynamically set
 * `--mouse-x` and `--mouse-y` for radial hover highlights on cards.
 *
 * Performance & Safety:
 * - Guards against coarse pointers (touch screens) and `prefers-reduced-motion`.
 * - Uses AbortController to cleanly cancel previous listeners across View Transitions (`astro:page-load`).
 * - Uses `requestAnimationFrame` with a ticking flag to prevent forced reflows / layout thrashing.
 * - Uses passive event listeners to avoid blocking scroll performance.
 */

let cardGlowCleanup: AbortController | null = null;

export function cleanupCardGlow(): void {
  if (cardGlowCleanup) {
    cardGlowCleanup.abort();
    cardGlowCleanup = null;
  }
}

export function initCardGlow(): void {
  cleanupCardGlow();

  // Guard for SSR or non-browser environments
  if (typeof window === "undefined" || typeof document === "undefined") {
    return;
  }

  // Skip on touch screens or when user prefers reduced motion
  if (
    window.matchMedia("(pointer: coarse), (prefers-reduced-motion: reduce)")
      .matches
  ) {
    return;
  }

  const cards = document.querySelectorAll<HTMLElement>(".card-glow");
  if (cards.length === 0) return;

  cardGlowCleanup = new AbortController();
  const { signal } = cardGlowCleanup;

  cards.forEach(card => {
    let ticking = false;

    card.addEventListener(
      "mousemove",
      (e: MouseEvent) => {
        if (ticking) return;
        ticking = true;

        window.requestAnimationFrame(() => {
          const rect = card.getBoundingClientRect();
          card.style.setProperty("--mouse-x", `${e.clientX - rect.left}px`);
          card.style.setProperty("--mouse-y", `${e.clientY - rect.top}px`);
          ticking = false;
        });
      },
      { signal, passive: true }
    );
  });
}

// Automatically register for Astro View Transitions
if (typeof document !== "undefined") {
  document.addEventListener("astro:page-load", initCardGlow);
}
