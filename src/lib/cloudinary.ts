import { v4 as uuidv4 } from 'uuid';

const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

export interface UploadResponse {
  secure_url: string;
  public_id: string;
  original_filename?: string;
  [key: string]: any;
}

// Unsigned client-side upload. Keep preset locked down to allowed sources/folder.
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

// Note: Destructive actions (deleting Cloudinary assets) must be signed server-side.
// Implement a serverless function (e.g., Vercel/Netlify) to proxy a signed destroy call
// and call that from the client if you need real deletion.
