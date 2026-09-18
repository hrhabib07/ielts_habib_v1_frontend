import type { ImageLoaderProps } from "next/image";

const UPLOAD = "/image/upload/";
const HERO_MAX_WIDTH = 1400;
const CARD_MAX_WIDTH = 900;

function insertTransform(src: string, transform: string): string {
  const index = src.indexOf(UPLOAD);
  if (index === -1) return src;

  const after = src.slice(index + UPLOAD.length);
  if (/^(f_|q_|w_|c_|e_)/.test(after)) return src;

  return `${src.slice(0, index + UPLOAD.length)}${transform}/${after}`;
}

function clampWidth(width: number, max: number): number {
  return Math.max(32, Math.min(Math.round(width), max));
}

export function cloudinaryLqipUrl(src: string): string {
  return insertTransform(src, "f_auto,q_auto:low,e_blur:1200,c_limit,w_32");
}

export function cloudinaryHeroLoader({ src, width }: ImageLoaderProps): string {
  return insertTransform(
    src,
    `f_auto,q_auto:good,c_limit,w_${clampWidth(width, HERO_MAX_WIDTH)}`,
  );
}

export function cloudinaryCardLoader({ src, width }: ImageLoaderProps): string {
  return insertTransform(
    src,
    `f_auto,q_auto,c_limit,w_${clampWidth(width, CARD_MAX_WIDTH)}`,
  );
}

/** Tight face crop for overlapping social-proof chips. */
export function cloudinaryFaceThumbUrl(src: string, size = 80): string {
  return insertTransform(
    src,
    `c_thumb,g_face,w_${size},h_${size},z_0.65,f_auto,q_auto`,
  );
}
