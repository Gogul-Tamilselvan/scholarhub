import { supabase } from "@/lib/supabase";

const S3_PRESIGN_FUNCTION = "s3-presign";

/**
 * Detect whether a URL points to our S3 bucket.
 */
function isS3Url(url: string): boolean {
  return /\.amazonaws\.com\//.test(url);
}

/**
 * For S3 URLs: call the presign edge function with action='download'.
 * This returns a presigned GetObject URL with Content-Disposition: attachment
 * so the browser ALWAYS downloads — no CORS issues, no PDF viewer takeover.
 *
 * For same-origin URLs (/downloads/...): fetch as blob and trigger download.
 * Falls back to window.open() if everything else fails.
 */
export async function downloadPdf(url: string, filename?: string): Promise<void> {
  const name = filename || url.split("/").pop() || "article.pdf";

  // ── S3 path: use presign edge function ──────────────────────────────────────
  if (isS3Url(url)) {
    try {
      const { data, error } = await supabase.functions.invoke(S3_PRESIGN_FUNCTION, {
        body: { action: "download", fileUrl: url, downloadName: name },
      });
      if (error || !data?.signedUrl) throw new Error(error?.message || "No signedUrl returned");

      // Open the presigned URL — it has Content-Disposition:attachment so
      // the browser will download it directly without a CORS fetch.
      const a = document.createElement("a");
      a.href = data.signedUrl;
      a.download = name;
      a.style.display = "none";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      return;
    } catch (err) {
      console.warn("Presign download failed, falling back to window.open:", err);
      window.open(url, "_blank");
      return;
    }
  }

  // ── Same-origin path: blob fetch ────────────────────────────────────────────
  try {
    const response = await fetch(url);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    const blob = await response.blob();
    const blobUrl = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = blobUrl;
    a.download = name;
    a.style.display = "none";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);

    setTimeout(() => URL.revokeObjectURL(blobUrl), 5000);
  } catch {
    window.open(url, "_blank");
  }
}

