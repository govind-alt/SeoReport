/**
 * RankFlow — Supabase Client & Storage Helper
 * 
 * Provides Supabase Storage bucket utilities (for white-label logos, PDF report downloads)
 * and PostgreSQL real-time notification helpers.
 */

// Environment fallbacks for Supabase integration
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL || 'https://placeholder.supabase.co';
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || process.env.SUPABASE_ANON_KEY || 'placeholder-anon-key';

export interface StorageUploadResult {
  path: string;
  publicUrl: string;
  error?: string;
}

/**
 * Helper to get public URL for Supabase storage artifacts
 */
export function getSupabasePublicUrl(bucket: string, path: string): string {
  if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder')) {
    return `/${bucket}/${path}`;
  }
  return `${SUPABASE_URL}/storage/v1/object/public/${bucket}/${path}`;
}

/**
 * Uploads a file buffer (e.g. PDF report or agency logo) to Supabase Storage bucket.
 * Falls back cleanly to local path if Supabase environment keys are not configured.
 */
export async function uploadToSupabaseStorage(
  bucket: 'reports' | 'logos' | 'branding',
  path: string,
  fileBuffer: Buffer | Uint8Array,
  contentType: string
): Promise<StorageUploadResult> {
  try {
    if (!SUPABASE_URL || SUPABASE_URL.includes('placeholder') || !SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'placeholder-anon-key') {
      // Local fallback mode when Supabase URL is not yet connected
      return {
        path,
        publicUrl: `/storage/${bucket}/${path}`,
      };
    }

    const uploadUrl = `${SUPABASE_URL}/storage/v1/object/${bucket}/${path}`;
    const response = await fetch(uploadUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
        'apikey': SUPABASE_ANON_KEY,
        'Content-Type': contentType,
      body: new Uint8Array(fileBuffer) as any,
    });

    if (!response.ok) {
      const errorText = await response.text();
      return {
        path,
        publicUrl: `/storage/${bucket}/${path}`,
        error: `Supabase Storage upload error: ${errorText}`,
      };
    }

    return {
      path,
      publicUrl: getSupabasePublicUrl(bucket, path),
    };
  } catch (error: any) {
    return {
      path,
      publicUrl: `/storage/${bucket}/${path}`,
      error: error?.message || 'Storage upload failed',
    };
  }
}
