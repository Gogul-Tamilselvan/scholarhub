import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { S3Client, PutObjectCommand, GetObjectCommand } from "npm:@aws-sdk/client-s3";
import { getSignedUrl } from "npm:@aws-sdk/s3-request-presigner";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Extract S3 key from a full S3 public URL
function extractKeyFromUrl(url: string): string | null {
  try {
    const u = new URL(url);
    // path starts with '/' — strip it
    return u.pathname.replace(/^\//, '');
  } catch {
    return null;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    const { action, fileName, fileType, fileUrl, downloadName } = body;

    const region = Deno.env.get('AWS_REGION') || "eu-north-1";
    const bucketName = Deno.env.get('AWS_S3_BUCKET_NAME') || "sipfiles04";
    const accessKeyId = Deno.env.get('AWS_ACCESS_KEY_ID');
    const secretAccessKey = Deno.env.get('AWS_SECRET_ACCESS_KEY');

    if (!accessKeyId || !secretAccessKey) {
      throw new Error("AWS credentials are not configured in edge function secrets");
    }

    const s3Client = new S3Client({
      region,
      credentials: { accessKeyId, secretAccessKey },
    });

    // ── DOWNLOAD: generate a presigned GET URL with Content-Disposition: attachment ──
    if (action === 'download') {
      if (!fileUrl) {
        return new Response(JSON.stringify({ error: 'fileUrl is required for download action' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const key = extractKeyFromUrl(fileUrl);
      if (!key) {
        return new Response(JSON.stringify({ error: 'Could not extract S3 key from fileUrl' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400,
        });
      }

      const filename = downloadName || key.split('/').pop() || 'article.pdf';
      const command = new GetObjectCommand({
        Bucket: bucketName,
        Key: key,
        ResponseContentDisposition: `attachment; filename="${filename}"`,
        ResponseContentType: 'application/pdf',
      });

      const signedUrl = await getSignedUrl(s3Client, command, { expiresIn: 300 });
      return new Response(JSON.stringify({ signedUrl }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    // ── UPLOAD (existing behaviour): generate a presigned PUT URL ──
    if (!fileName || !fileType) {
      return new Response(JSON.stringify({ error: 'fileName and fileType are required' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const putCommand = new PutObjectCommand({
      Bucket: bucketName,
      Key: fileName,
      ContentType: fileType,
    });

    const signedUrl = await getSignedUrl(s3Client, putCommand, { expiresIn: 300 });
    const publicUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;

    return new Response(
      JSON.stringify({ signedUrl, publicUrl }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
    );
  } catch (error) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
