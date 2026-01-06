import type { ImageMetadata, UploadProgress } from '../types/gallery';

// Default gallery settings
export const DEFAULT_GALLERY_SETTINGS = {
  maxFileSize: 10 * 1024 * 1024, // 10MB
  allowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
  maxImagesPerAlbum: 1000,
  defaultAlbumSettings: {
    allowComments: false,
    allowDownloads: true,
    isPublic: true,
  },
};

// Generate unique ID
const generateId = () => Date.now().toString(36) + Math.random().toString(36).substr(2);

// Format file size
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

// Validate image file
export function validateImageFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > DEFAULT_GALLERY_SETTINGS.maxFileSize) {
    return {
      valid: false,
      error: `File size exceeds ${formatFileSize(DEFAULT_GALLERY_SETTINGS.maxFileSize)}`,
    };
  }

  // Check file format
  const extension = file.name.split('.').pop()?.toLowerCase();
  if (!extension || !DEFAULT_GALLERY_SETTINGS.allowedFormats.includes(extension)) {
    return {
      valid: false,
      error: `File format not allowed. Allowed formats: ${DEFAULT_GALLERY_SETTINGS.allowedFormats.join(', ')}`,
    };
  }

  return { valid: true };
}

// Get image dimensions
export function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      resolve({ width: img.width, height: img.height });
      URL.revokeObjectURL(img.src);
    };
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Create thumbnail (in production, this would be done server-side)
export async function createThumbnail(file: File, maxWidth = 300, maxHeight = 300): Promise<string> {
  return new Promise((resolve, reject) => {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      reject(new Error('Canvas not supported'));
      return;
    }

    const img = new Image();
    img.onload = () => {
      // Calculate dimensions
      let width = img.width;
      let height = img.height;
      
      if (width > maxWidth || height > maxHeight) {
        const ratio = Math.min(maxWidth / width, maxHeight / height);
        width *= ratio;
        height *= ratio;
      }

      canvas.width = width;
      canvas.height = height;

      // Draw and resize
      ctx.drawImage(img, 0, 0, width, height);
      
      // Convert to blob
      canvas.toBlob(
        (blob) => {
          if (blob) {
            resolve(URL.createObjectURL(blob));
          } else {
            reject(new Error('Failed to create thumbnail'));
          }
        },
        'image/jpeg',
        0.8
      );
      
      URL.revokeObjectURL(img.src);
    };
    
    img.onerror = reject;
    img.src = URL.createObjectURL(file);
  });
}

// Upload image with progress tracking
export async function uploadImageWithProgress(
  file: File,
  onProgress?: (progress: UploadProgress) => void
): Promise<ImageMetadata> {
  const uploadId = generateId();
  
  // Initial progress
  onProgress?.({
    id: uploadId,
    filename: file.name,
    progress: 0,
    status: 'pending',
  });

  try {
    // Validate file
    const validation = validateImageFile(file);
    if (!validation.valid) {
      throw new Error(validation.error);
    }

    // Get dimensions
    const dimensions = await getImageDimensions(file);

    // Create thumbnail
    const thumbnailUrl = await createThumbnail(file);

    // Simulate upload progress
    for (let i = 0; i <= 100; i += 10) {
      onProgress?.({
        id: uploadId,
        filename: file.name,
        progress: i,
        status: 'uploading',
        preview: thumbnailUrl,
      });
      await new Promise(resolve => setTimeout(resolve, 100));
    }

    // Create metadata
    const metadata: ImageMetadata = {
      id: generateId(),
      name: file.name,
      filename: `${generateId()}.${file.name.split('.').pop()}`,
      originalName: file.name,
      url: URL.createObjectURL(file), // In production, this would be the server URL
      thumbnailUrl,
      size: file.size,
      width: dimensions.width,
      height: dimensions.height,
      format: file.name.split('.').pop()?.toLowerCase() || 'jpg',
      uploadedAt: new Date().toISOString(),
      tags: [],
      order: 0,
      status: 'active',
    };

    onProgress?.({
      id: uploadId,
      filename: file.name,
      progress: 100,
      status: 'success',
      preview: thumbnailUrl,
    });

    return metadata;
  } catch (error) {
    onProgress?.({
      id: uploadId,
      filename: file.name,
      progress: 0,
      status: 'error',
      error: error instanceof Error ? error.message : 'Upload failed',
    });
    throw error;
  }
}

// Batch upload images
export async function batchUploadImages(
  files: File[],
  onProgress?: (progress: UploadProgress) => void,
  onComplete?: (results: ImageMetadata[]) => void
): Promise<ImageMetadata[]> {
  const results: ImageMetadata[] = [];
  
  for (const file of files) {
    try {
      const metadata = await uploadImageWithProgress(file, onProgress);
      results.push(metadata);
    } catch (error) {
      console.error(`Failed to upload ${file.name}:`, error);
    }
  }
  
  onComplete?.(results);
  return results;
}

// Search images by tags or filename
export function searchImages(
  images: ImageMetadata[],
  query: string
): ImageMetadata[] {
  const searchTerm = query.toLowerCase();
  
  return images.filter(image => {
    // Search in filename
    if (image.originalName.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in caption
    if (image.caption?.vi?.toLowerCase().includes(searchTerm) || 
        image.caption?.en?.toLowerCase().includes(searchTerm)) {
      return true;
    }
    
    // Search in tags
    if (image.tags.some(tag => tag.toLowerCase().includes(searchTerm))) {
      return true;
    }
    
    return false;
  });
}

// Sort images
export function sortImages(
  images: ImageMetadata[],
  sortBy: 'date' | 'name' | 'size' | 'custom',
  sortOrder: 'asc' | 'desc'
): ImageMetadata[] {
  return [...images].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'date':
        comparison = new Date(a.uploadedAt).getTime() - new Date(b.uploadedAt).getTime();
        break;
      case 'name':
        comparison = a.originalName.localeCompare(b.originalName);
        break;
      case 'size':
        comparison = a.size - b.size;
        break;
      case 'custom':
        comparison = (a.order || 0) - (b.order || 0);
        break;
    }
    
    return sortOrder === 'desc' ? -comparison : comparison;
  });
}
