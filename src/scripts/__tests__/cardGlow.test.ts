// @vitest-environment happy-dom

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { initCardGlow, cleanupCardGlow } from "../cardGlow";

describe("cardGlow cursor tracking", () => {
  let card: HTMLDivElement;
  let rafCallbacks: FrameRequestCallback[] = [];

  beforeEach(() => {
    // Reset DOM
    document.body.innerHTML = `
      <div id="container">
        <div class="card-glow" style="width: 200px; height: 100px;"></div>
        <div class="card-glow" style="width: 200px; height: 100px;"></div>
      </div>
    `;

    card = document.querySelector<HTMLDivElement>(".card-glow")!;

    // Mock getBoundingClientRect
    vi.spyOn(card, "getBoundingClientRect").mockReturnValue({
      left: 50,
      top: 100,
      right: 250,
      bottom: 200,
      width: 200,
      height: 100,
      x: 50,
      y: 100,
      toJSON: () => {},
    });

    // Mock requestAnimationFrame
    rafCallbacks = [];
    vi.spyOn(window, "requestAnimationFrame").mockImplementation(cb => {
      rafCallbacks.push(cb);
      return rafCallbacks.length;
    });

    // Default matchMedia: fine pointer, no reduced motion
    vi.spyOn(window, "matchMedia").mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));
  });

  afterEach(() => {
    cleanupCardGlow();
    vi.restoreAllMocks();
  });

  function flushRaf() {
    const callbacks = [...rafCallbacks];
    rafCallbacks = [];
    callbacks.forEach(cb => cb(performance.now()));
  }

  it("updates --mouse-x and --mouse-y relative to card bounds on mousemove", () => {
    initCardGlow();

    // Fire mousemove at clientX=150, clientY=160
    // Relative: x = 150 - 50 = 100px, y = 160 - 100 = 60px
    const event = new MouseEvent("mousemove", {
      clientX: 150,
      clientY: 160,
    });
    card.dispatchEvent(event);

    flushRaf();

    expect(card.style.getPropertyValue("--mouse-x")).toBe("100px");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("60px");
  });

  it("batches multiple mousemoves in the same frame to prevent layout thrashing", () => {
    initCardGlow();

    // Fire 3 mousemove events before RAF runs
    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 60, clientY: 110 })
    );
    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 70, clientY: 120 })
    );
    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 80, clientY: 130 })
    );

    // Only 1 RAF should be scheduled because of the ticking guard
    expect(rafCallbacks.length).toBe(1);

    flushRaf();

    // Should reflect the coordinates of the event that triggered the scheduled frame
    expect(card.style.getPropertyValue("--mouse-x")).toBe("10px");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("10px");
  });

  it("cancels previous listeners on re-initialization (View Transitions test)", () => {
    initCardGlow();
    // Simulate navigation by calling initCardGlow multiple times
    initCardGlow();
    initCardGlow();

    // Fire mousemove
    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 90, clientY: 140 })
    );

    // Only 1 RAF callback should be queued (not 3 accumulated)
    expect(rafCallbacks.length).toBe(1);

    flushRaf();
    expect(card.style.getPropertyValue("--mouse-x")).toBe("40px");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("40px");
  });

  it("skips attaching listeners on touch devices (pointer: coarse)", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(query => ({
      matches: query.includes("pointer: coarse"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    initCardGlow();

    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 150, clientY: 160 })
    );
    flushRaf();

    expect(card.style.getPropertyValue("--mouse-x")).toBe("");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("");
  });

  it("skips attaching listeners when user prefers reduced motion", () => {
    vi.spyOn(window, "matchMedia").mockImplementation(query => ({
      matches: query.includes("prefers-reduced-motion: reduce"),
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }));

    initCardGlow();

    card.dispatchEvent(
      new MouseEvent("mousemove", { clientX: 150, clientY: 160 })
    );
    flushRaf();

    expect(card.style.getPropertyValue("--mouse-x")).toBe("");
    expect(card.style.getPropertyValue("--mouse-y")).toBe("");
  });

  it("handles pages with zero .card-glow elements cleanly", () => {
    document.body.innerHTML = `<div>No cards here</div>`;

    expect(() => {
      initCardGlow();
    }).not.toThrow();
  });
});
