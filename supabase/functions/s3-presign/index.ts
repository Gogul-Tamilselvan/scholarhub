import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { S3Client, PutObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight request
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const { fileName, fileType } = await req.json();

    if (!fileName || !fileType) {
      return new Response(JSON.stringify({ error: 'fileName and fileType are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // No VITE_ prefix here! Secure environment variables inside Supabase.
    const region = Deno.env.get('AWS_REGION') || "ap-southeast-2";
    const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME') || "gogul-files-01";
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials are not configured in edge function secrets");
    }

    const s3Client = new S3Client({
      region,
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
    });

    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    // Create a presigned URL that the frontend can securely use to PUT the file without holding any AWS keys
    const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
    
    // The public URL that the frontend stores in the database
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    return new Response(
      JSON.stringify({ signedUrl, publicUrl }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
