const MAX_SIDE = 320;
const QUALITY = 0.82;

/** Square-crops and shrinks a chosen photo to a small JPEG data URL (about 20 to 60 KB). */
export async function resizePhoto(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  const url = URL.createObjectURL(file);
  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error("Could not read the photo"));
      img.src = url;
    });
    const side = Math.min(image.naturalWidth, image.naturalHeight);
    const size = Math.min(MAX_SIDE, side);
    const canvas = document.createElement("canvas");
    canvas.width = size;
    canvas.height = size;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas is not supported");
    context.drawImage(
      image,
      (image.naturalWidth - side) / 2,
      (image.naturalHeight - side) / 2,
      side,
      side,
      0,
      0,
      size,
      size,
    );
    return canvas.toDataURL("image/jpeg", QUALITY);
  } finally {
    URL.revokeObjectURL(url);
  }
}
