import { supabase } from './supabase';

/**
 * Upload a File to AWS S3 via Supabase Edge Function (s3-presign)
 * This method is secure because it doesn't expose AWS keys to the frontend.
 * The Edge Function fetches keys from Supabase Secrets and returns a temporary presigned URL.
 * 
 * @param file    - The File object to upload
 * @param folder  - Folder prefix inside the bucket (e.g. 'publication-pdfs')
 */
export async function uploadToS3(
  file: File,
  folder: string = 'publication-pdfs'
): Promise<string> {
  const fileName = `${folder}/${Date.now()}_${file.name.replace(/\s+/g, '_')}`;
  
  // 1. Request a presigned URL from the 's3-presign' Edge Function
  const { data, error: functionError } = await supabase.functions.invoke('s3-presign', {
    body: { 
      fileName, 
      fileType: file.type || 'application/pdf' 
    }
  });

  if (functionError) {
    console.error('Edge Function Error:', functionError);
    throw new Error(`Edge Function Error: ${functionError.message}`);
  }
  
  if (!data?.signedUrl) {
    throw new Error('Failed to retrieve signed URL from Edge Function');
  }

  const { signedUrl, publicUrl } = data;

  // 2. Perform the actual upload to S3 using the temporary signed URL
  // This uses a direct PUT request, which is handled directly by S3
  const response = await fetch(signedUrl, {
    method: 'PUT',
    body: file,
    headers: {
      'Content-Type': file.type || 'application/pdf',
    },
  });

  if (!response.ok) {
    const errorText = await response.text();
    console.error('S3 Upload Error:', errorText);
    throw new Error(`S3 Upload Failed: ${response.statusText}`);
  }

  // Return the public URL to be stored in the database
  return publicUrl;
}
