// supabase/functions/update-ticket-status/index.ts
// Edge Function to update ticket status (admin only)

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface UpdateStatusRequest {
  ticket_id: string;
  status: "pending" | "resolved" | "closed";
  admin_id: string;
}

// Validate input
function validateInput(data: UpdateStatusRequest): string | null {
  if (!data.ticket_id) {
    return "Ticket ID is required";
  }
  if (!data.status || !["pending", "resolved", "closed"].includes(data.status)) {
    return "Invalid status";
  }
  if (!data.admin_id) {
    return "Admin ID is required";
  }
  return null;
}

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Use service role key for backend operations
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: UpdateStatusRequest = await req.json();

    // Validate input
    const validationError = validateInput(body);
    if (validationError) {
      return new Response(
        JSON.stringify({ error: validationError }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    console.log("Update ticket status request:", { ticket_id: body.ticket_id, status: body.status, admin_id: body.admin_id });
    console.log("Supabase URL:", Deno.env.get("SUPABASE_URL"));
    console.log("Service role key present:", !!Deno.env.get("SUPABASE_SERVICE_ROLE_KEY"));

    // Update ticket status
    const updateData: any = {
      status: body.status,
      admin_id: body.admin_id,
      updated_at: new Date().toISOString(),
    };

    // Set resolved_at if status is resolved or closed
    if (body.status === "resolved" || body.status === "closed") {
      updateData.resolved_at = new Date().toISOString();
    }

    const { data: ticket, error: updateError } = await supabaseClient
      .from("tickets")
      .update(updateData)
      .eq("id", body.ticket_id)
      .select()
      .single();

    console.log("Update result:", { data: ticket, error: updateError });

    if (updateError) {
      console.error("Update error details:", JSON.stringify(updateError, null, 2));
      throw updateError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket: ticket,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error updating ticket status:", error);
    let errorMessage = "Unknown error";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else {
      errorMessage = String(error);
    }
    
    return new Response(
      JSON.stringify({ 
        error: "Failed to update ticket status",
        details: errorMessage 
      }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
