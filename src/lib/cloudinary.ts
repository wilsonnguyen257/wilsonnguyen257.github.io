import { v4 as uuidv4 } from 'uuid';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

interface UploadResponse {
  secure_url: string;
  public_id: string;
  [key: string]: any;
}

export const uploadImage = async (file: File): Promise<UploadResponse> => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', UPLOAD_PRESET);
  formData.append('folder', 'church-gallery');
  formData.append('public_id', `gallery_${uuidv4()}`);

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to upload image');
  }

  return response.json();
};

export const deleteImage = async (publicId: string): Promise<void> => {
  const timestamp = Math.round(new Date().getTime() / 1000);
  const signature = await generateSignature(publicId, timestamp);
  
  const formData = new FormData();
  formData.append('public_id', publicId);
  formData.append('signature', signature);
  formData.append('api_key', import.meta.env.VITE_CLOUDINARY_API_KEY);
  formData.append('timestamp', timestamp.toString());

  const response = await fetch(
    `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/destroy`,
    {
      method: 'POST',
      body: formData,
    }
  );

  if (!response.ok) {
    const error = await response.json();
    throw new Error(error.message || 'Failed to delete image');
  }
};

const generateSignature = async (publicId: string, timestamp: number): Promise<string> => {
  // In a real app, you should call a Firebase Function to generate the signature
  // This is just a placeholder - you should NEVER expose your API secret in client-side code
  console.warn('Using client-side signature generation is not secure. Use a server-side function instead.');
  
  const message = `public_id=${publicId}&timestamp=${timestamp}${import.meta.env.VITE_CLOUDINARY_API_SECRET}`;
  const encoder = new TextEncoder();
  const data = encoder.encode(message);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
  return hashHex;
};

export const getGalleryImages = async (): Promise<Array<{ url: string; id: string; name: string; created: number }>> => {
  try {
    const credentials = btoa(`${import.meta.env.VITE_CLOUDINARY_API_KEY}:${import.meta.env.VITE_CLOUDINARY_API_SECRET}`);
    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/resources/image?type=upload&prefix=church-gallery/`,
      {
        headers: {
          'Authorization': `Basic ${credentials}`
        }
      }
    );
    
    if (!response.ok) {
      throw new Error('Failed to fetch images');
    }
    
    const data = await response.json();
    return data.resources.map((img: any) => ({
      url: img.secure_url,
      id: img.public_id,
      name: img.public_id.split('/').pop() || 'image',
      created: new Date(img.created_at).getTime()
    }));
  } catch (error) {
    console.error('Error fetching gallery images:', error);
    return [];
  }
};
