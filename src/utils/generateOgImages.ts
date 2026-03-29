import { Resvg, initWasm } from "@resvg/resvg-wasm";
import { type CollectionEntry } from "astro:content";
import postOgImage from "./og-templates/post";
import siteOgImage from "./og-templates/site";
import fs from "node:fs";
import path from "node:path";

let wasmInitialized = false;

async function ensureWasmInitialized() {
  if (!wasmInitialized) {
    const wasmPath = path.join(
      process.cwd(),
      "node_modules/@resvg/resvg-wasm/index_bg.wasm"
    );
    const wasmBuffer = await fs.promises.readFile(wasmPath);
    await initWasm(wasmBuffer);
    wasmInitialized = true;
  }
}

async function svgBufferToPngBuffer(svg: string) {
  await ensureWasmInitialized();
  const resvg = new Resvg(svg);
  const pngData = resvg.render();
  return pngData.asPng();
}

export async function generateOgImageForPost(post: CollectionEntry<"blog">) {
  const svg = await postOgImage(post);
  return svgBufferToPngBuffer(svg);
}

export async function generateOgImageForSite() {
  const svg = await siteOgImage();
  return svgBufferToPngBuffer(svg);
}
