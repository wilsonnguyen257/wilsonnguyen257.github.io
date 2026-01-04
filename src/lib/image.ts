import imageCompression from 'browser-image-compression';

/**
 * Compresses an image file before upload.
 * Default settings: Max 1MB, Max 1920px width/height.
 */
export async function compressImage(file: File): Promise<File> {
  // Options for compression
  const options = {
    maxSizeMB: 1,              // Max file size in MB
    maxWidthOrHeight: 1920,    // Max width/height in pixels
    useWebWorker: true,        // Use web worker for better performance
    initialQuality: 0.8,       // Initial quality (0 to 1)
  };

  try {
    // Only compress images
    if (!file.type.startsWith('image/')) {
      return file;
    }

    // Skip compression for small files (< 500KB)
    if (file.size / 1024 / 1024 < 0.5) {
      return file;
    }

    console.log(`Original size: ${(file.size / 1024 / 1024).toFixed(2)} MB`);
    const compressedFile = await imageCompression(file, options);
    console.log(`Compressed size: ${(compressedFile.size / 1024 / 1024).toFixed(2)} MB`);
    
    return compressedFile;
  } catch (error) {
    console.error('Image compression failed:', error);
    // Return original file if compression fails
    return file;
  }
}
