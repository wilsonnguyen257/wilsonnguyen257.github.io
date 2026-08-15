import imageCompression from 'browser-image-compression';
import type { Options } from 'browser-image-compression';

export interface ProcessedImage {
  /** Full-size version for the lightbox / detail view. */
  display: File;
  /** Small version for grid tiles, so browsing doesn't download full-size photos. */
  thumbnail: File;
}

// A single format/size standard applied to every upload, regardless of what
// resolution or format the visitor's camera/phone produced.
const DISPLAY_MAX_DIMENSION = 1920;
const DISPLAY_MAX_SIZE_MB = 1;
const DISPLAY_QUALITY = 0.82;

const THUMBNAIL_MAX_DIMENSION = 480;
const THUMBNAIL_MAX_SIZE_MB = 0.25;
const THUMBNAIL_QUALITY = 0.75;

const WEBP_TYPE = 'image/webp';

function baseName(fileName: string): string {
  const dot = fileName.lastIndexOf('.');
  return dot > 0 ? fileName.slice(0, dot) : fileName;
}

function renameFile(file: File, name: string, type: string): File {
  return new File([file], name, { type, lastModified: file.lastModified });
}

async function resizeToWebp(file: File, maxWidthOrHeight: number, maxSizeMB: number, initialQuality: number): Promise<File> {
  const options: Options = {
    maxWidthOrHeight,
    maxSizeMB,
    initialQuality,
    useWebWorker: true,
    fileType: WEBP_TYPE,
  };
  return imageCompression(file, options);
}

/**
 * Prepares an uploaded photo for the gallery: a display-size version (for
 * the lightbox) and a small thumbnail (for grid tiles), both normalized to
 * WebP so file size and format stay consistent no matter what resolution or
 * format the visitor's device produced.
 *
 * Animated GIFs keep their original file as the display version (re-encoding
 * through a canvas would flatten the animation to a single frame); only a
 * static thumbnail is generated for them, since grid tiles don't need to
 * animate.
 */
export async function processImageForUpload(file: File): Promise<ProcessedImage> {
  if (!file.type.startsWith('image/')) {
    return { display: file, thumbnail: file };
  }

  const isGif = file.type === 'image/gif';
  const name = baseName(file.name);

  try {
    const thumbnail = renameFile(
      await resizeToWebp(file, THUMBNAIL_MAX_DIMENSION, THUMBNAIL_MAX_SIZE_MB, THUMBNAIL_QUALITY),
      `${name}-thumb.webp`,
      WEBP_TYPE
    );

    if (isGif) {
      return { display: file, thumbnail };
    }

    const display = renameFile(
      await resizeToWebp(file, DISPLAY_MAX_DIMENSION, DISPLAY_MAX_SIZE_MB, DISPLAY_QUALITY),
      `${name}.webp`,
      WEBP_TYPE
    );

    return { display, thumbnail };
  } catch (error) {
    console.error('Image processing failed, using original file:', error);
    return { display: file, thumbnail: file };
  }
}

/**
 * Single-file compression used by pages that only need one image (event and
 * reflection thumbnails). Gallery uploads should use processImageForUpload
 * instead, since they also need a small grid thumbnail.
 */
export async function compressImage(file: File): Promise<File> {
  const { display } = await processImageForUpload(file);
  return display;
}
