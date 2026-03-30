import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { feature } from "topojson-client";
import { geoEquirectangular, geoPath } from "d3-geo";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const topoPath = path.join(__dirname, "land-110m.json");
const clipOut = path.join(root, "src/components/home/worldLandClipPath.generated.ts");
const anchorsOut = path.join(
  root,
  "src/components/home/worldJourneyAnchors.generated.ts",
);

/** [lng, lat] approximate geographic centers — projected to hero viewBox. */
const COUNTRY_LNGLAT = {
  bangladesh: [90.3563, 23.685],
  india: [78.9629, 20.5937],
  pakistan: [69.3451, 30.3753],
  nepal: [84.124, 28.3949],
  "sri lanka": [80.7718, 7.8731],
  "united kingdom": [-3.436, 55.3781],
  uk: [-3.436, 55.3781],
  england: [-1.1743, 52.3555],
  ireland: [-8.2439, 53.4129],
  "united states": [-98.5795, 39.8283],
  usa: [-98.5795, 39.8283],
  canada: [-106.3468, 56.1304],
  australia: [133.7751, -25.2744],
  germany: [10.4515, 51.1657],
  france: [2.2137, 46.2276],
  denmark: [9.5018, 56.2639],
  netherlands: [5.2913, 52.1326],
  sweden: [18.6435, 60.1282],
  norway: [8.4689, 60.472],
  japan: [138.2529, 36.2048],
  "new zealand": [174.886, -40.9006],
  malaysia: [101.9758, 4.2105],
  singapore: [103.8198, 1.3521],
  china: [104.1954, 35.8617],
  "south korea": [127.7669, 35.9078],
  uae: [53.8478, 23.4241],
  "saudi arabia": [45.0792, 23.8859],
  egypt: [30.8025, 26.8206],
  nigeria: [8.6753, 9.082],
  "south africa": [22.9375, -30.5595],
  brazil: [-51.9253, -14.235],
  mexico: [-102.5528, 23.6345],
};

const land = JSON.parse(fs.readFileSync(topoPath, "utf8"));
const fc = feature(land, land.objects.land);

const projection = geoEquirectangular().fitExtent(
  [
    [0, 0],
    [1000, 500],
  ],
  fc,
);

const pathGen = geoPath(projection);
const d = pathGen(fc);

if (!d || typeof d !== "string") {
  throw new Error("Failed to generate SVG path");
}

const clipHeader = `/**
 * Auto-generated from Natural Earth land-110m (via topojson/world-atlas, ISC license).
 * Projection: equirectangular fitted to viewBox 0 0 1000 500.
 * Do not edit by hand — run: node scripts/generate-world-clip.mjs
 */
`;

fs.writeFileSync(
  clipOut,
  `${clipHeader}export const WORLD_LAND_CLIP_PATH_D: string = ${JSON.stringify(d)};\n`,
  "utf8",
);

const anchors = {};
for (const [key, [lng, lat]] of Object.entries(COUNTRY_LNGLAT)) {
  const p = projection([lng, lat]);
  if (p)
    anchors[key] = {
      x: Math.round(p[0] * 100) / 100,
      y: Math.round(p[1] * 100) / 100,
    };
}

const defaultFrom = anchors.bangladesh ?? { x: 500, y: 250 };
const defaultTo = anchors.uk ?? { x: 500, y: 200 };

const anchorsHeader = `/**
 * Country label → {x,y} in hero map viewBox (same projection as worldLandClipPath.generated).
 * Auto-generated — run: node scripts/generate-world-clip.mjs
 */
`;

const anchorsBody = `${anchorsHeader}export const JOURNEY_COUNTRY_ANCHORS: Record<string, { x: number; y: number }> = ${JSON.stringify(anchors, null, 2)};

export const JOURNEY_DEFAULT_FROM = ${JSON.stringify(defaultFrom)} as const;
export const JOURNEY_DEFAULT_TO = ${JSON.stringify(defaultTo)} as const;
`;

fs.writeFileSync(anchorsOut, anchorsBody, "utf8");

console.log("Wrote", clipOut, "path length", d.length);
console.log("Wrote", anchorsOut);
