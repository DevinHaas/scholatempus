/**
 * Generates iOS PWA splash screen PNGs for ScholaTempus.
 * Run with: bun run apps/frontend/scripts/generate-splash.ts
 *
 * Requires: bun install sharp
 */

import sharp from "sharp";
import { mkdirSync } from "fs";
import { join } from "path";

const OUT_DIR = join(import.meta.dir, "../public/splash");
mkdirSync(OUT_DIR, { recursive: true });

const BG = "#F8F7F3";
const PRIMARY = "#4A6CF7";
const TEXT_DARK = "#1A1D2E";

const SIZES = [
  { name: "splash-1290x2796.png", w: 1290, h: 2796 },
  { name: "splash-1179x2556.png", w: 1179, h: 2556 },
  { name: "splash-1170x2532.png", w: 1170, h: 2532 },
  { name: "splash-1242x2688.png", w: 1242, h: 2688 },
  { name: "splash-828x1792.png", w: 828, h: 1792 },
  { name: "splash-750x1334.png", w: 750, h: 1334 },
  { name: "splash-2048x2732.png", w: 2048, h: 2732 },
  { name: "splash-1668x2388.png", w: 1668, h: 2388 },
  { name: "splash-1640x2360.png", w: 1640, h: 2360 },
];

async function generateSplash(name: string, w: number, h: number) {
  // Scale logo relative to screen width
  const logoSize = Math.round(w * 0.18);
  const radius = Math.round(logoSize * 0.25);
  const fontSize = Math.round(logoSize * 0.38);
  const cx = w / 2;
  const logoY = h / 2 - logoSize / 2 - Math.round(h * 0.04);
  const textY = logoY + logoSize + Math.round(h * 0.03);
  const subtitleY = textY + Math.round(h * 0.03);
  const wordmarkSize = Math.round(w * 0.055);
  const subtitleSize = Math.round(w * 0.033);

  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}">
      <rect width="${w}" height="${h}" fill="${BG}"/>

      <!-- Logo mark rounded square -->
      <rect
        x="${cx - logoSize / 2}" y="${logoY}"
        width="${logoSize}" height="${logoSize}"
        rx="${radius}" ry="${radius}"
        fill="${PRIMARY}"
      />

      <!-- ST text -->
      <text
        x="${cx}" y="${logoY + logoSize / 2 + fontSize * 0.35}"
        font-family="Arial, sans-serif"
        font-size="${fontSize}"
        font-weight="700"
        fill="white"
        text-anchor="middle"
        letter-spacing="-1"
      >ST</text>

      <!-- Wordmark -->
      <text
        x="${cx}" y="${textY}"
        font-family="Arial, sans-serif"
        font-size="${wordmarkSize}"
        font-weight="600"
        fill="${TEXT_DARK}"
        text-anchor="middle"
      >ScholaTempus</text>

      <!-- Subtitle -->
      <text
        x="${cx}" y="${subtitleY}"
        font-family="Arial, sans-serif"
        font-size="${subtitleSize}"
        font-weight="400"
        fill="#6B7280"
        text-anchor="middle"
      >Zeiterfassung für Lehrpersonen</text>
    </svg>
  `;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(join(OUT_DIR, name));

  console.log(`✓ Generated ${name} (${w}×${h})`);
}

for (const { name, w, h } of SIZES) {
  await generateSplash(name, w, h);
}

console.log("\nAll splash screens generated in public/splash/");
console.log("Note: For production, use pwa-asset-generator for best quality.");
