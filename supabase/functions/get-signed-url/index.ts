// supabase/functions/get-signed-url/index.ts
// Edge Function to generate signed URLs for file uploads/downloads

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface SignedUrlRequest {
  action: "upload" | "download";
  file_name: string;
  file_type: string;
  message_id?: string;
}

// Validate file type
function isValidFileType(fileType: string): boolean {
  const allowedTypes = [
    "image/jpeg",
    "image/png",
    "image/gif",
    "image/webp",
    "video/mp4",
    "video/webm",
    "application/pdf",
    "application/msword",
    "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    "application/vnd.ms-excel",
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    "text/plain",
    "application/zip",
  ];
  return allowedTypes.includes(fileType);
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_ANON_KEY") ?? ""
    );

    const body: SignedUrlRequest = await req.json();

    // Validate input
    if (!body.action || !["upload", "download"].includes(body.action)) {
      return new Response(
        JSON.stringify({ error: "Invalid action" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!body.file_name || !body.file_type) {
      return new Response(
        JSON.stringify({ error: "File name and type are required" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (!isValidFileType(body.file_type)) {
      return new Response(
        JSON.stringify({ error: "File type not allowed" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create file path with timestamp to avoid collisions
    const timestamp = Date.now();
    const sanitizedFileName = body.file_name.replace(/[^a-zA-Z0-9._-]/g, "_");
    const filePath = `attachments/${timestamp}_${sanitizedFileName}`;

    let url: string;
    let token: string | undefined;

    if (body.action === "upload") {
      // Generate signed upload URL (valid for 1 hour)
      const { data, error } = await supabaseClient.storage
        .from("support-attachments")
        .createSignedUploadUrl(filePath);

      if (error) {
        console.error("Upload URL error:", error);
        throw error;
      }

      url = data.signedUrl;
      token = data.token;
    } else {
      // Generate signed download URL (valid for 7 days)
      const { data, error } = await supabaseClient.storage
        .from("support-attachments")
        .createSignedUrl(filePath, 604800);

      if (error) {
        console.error("Download URL error:", error);
        throw error;
      }

      url = data.signedUrl;
    }

    const responseData: any = {
      success: true,
      signed_url: url,
      file_path: filePath,
    };

    // Include token for upload requests
    if (body.action === "upload" && token) {
      responseData.token = token;
    }

    return new Response(
      JSON.stringify(responseData),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error generating signed URL:", error);
    return new Response(
      JSON.stringify({ error: "Failed to generate signed URL" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
