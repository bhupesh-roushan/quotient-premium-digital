import mime from "mime-types";
import sharp from "sharp";

export async function downloadAndInspectImage(url: string) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 2000);

  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error("Download failed");

    const createArrayBuffer = await res.arrayBuffer();
    const buffer = Buffer.from(createArrayBuffer);

    const MAX_BYTES = 10 * 1024 * 1024;

    if (buffer.length > MAX_BYTES) {
      throw new Error("Image too large");
    }

    // Get content type from response headers or guess from URL
    const contentType = res.headers.get('content-type') || mime.lookup(url) || 'application/octet-stream';
    
    if (!contentType.startsWith("image/"))
      throw new Error("Not an image");

    const meta = await sharp(buffer).metadata();
    const width = meta.width ?? 0;
    const height = meta.height ?? 0;

    // Get file extension from mime type
    const ext = mime.extension(contentType) || 'jpg';
    const fileName = `img_${Date.now()}.${ext}`;

    return {
      buffer,
      contentType,
      sizeBytes: buffer.length,
      width,
      height,
      fileName,
      fileNameNoExt: fileName.replace(/\.[^.]+$/, ""),
    };
  } catch (e) {
    console.log(e);
    throw e;
  } finally {
    clearTimeout(timer);
  }
}
