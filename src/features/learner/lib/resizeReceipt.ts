const MAX_SIDE = 1400;
/** Keeps the upload under the server's 340 KB receipt limit. */
const MAX_DATA_URL_CHARS = 440_000;
const QUALITIES = [0.82, 0.7, 0.58, 0.46] as const;

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error("Could not read the screenshot"));
    img.src = url;
  });
}

/** Shrinks a payment screenshot (keeping its shape, so text stays readable) to a JPEG data URL. */
export async function resizeReceipt(file: File): Promise<string> {
  if (!file.type.startsWith("image/")) throw new Error("Not an image");
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    let scale = Math.min(1, MAX_SIDE / Math.max(image.naturalWidth, image.naturalHeight));
    for (let round = 0; round < 3; round += 1) {
      const canvas = document.createElement("canvas");
      canvas.width = Math.max(1, Math.round(image.naturalWidth * scale));
      canvas.height = Math.max(1, Math.round(image.naturalHeight * scale));
      const context = canvas.getContext("2d");
      if (!context) throw new Error("Canvas is not supported");
      context.fillStyle = "#ffffff";
      context.fillRect(0, 0, canvas.width, canvas.height);
      context.drawImage(image, 0, 0, canvas.width, canvas.height);
      for (const quality of QUALITIES) {
        const dataUrl = canvas.toDataURL("image/jpeg", quality);
        if (dataUrl.length <= MAX_DATA_URL_CHARS) return dataUrl;
      }
      scale *= 0.7;
    }
    throw new Error("The screenshot is too large");
  } finally {
    URL.revokeObjectURL(url);
  }
}
