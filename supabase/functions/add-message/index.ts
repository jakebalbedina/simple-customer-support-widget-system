// supabase/functions/add-message/index.ts
// Edge Function to add a message to a ticket

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface AddMessageRequest {
  ticket_id: string;
  sender_id: string;
  sender_type: "customer" | "admin";
  content: string;
}

// Validate input
function validateInput(data: AddMessageRequest): string | null {
  if (!data.ticket_id) {
    return "Ticket ID is required";
  }
  if (!data.sender_id) {
    return "Sender ID is required";
  }
  if (!data.sender_type || !["customer", "admin"].includes(data.sender_type)) {
    return "Invalid sender type";
  }
  if (!data.content || data.content.trim().length === 0) {
    return "Message content is required";
  }
  if (data.content.length > 5000) {
    return "Message must be less than 5000 characters";
  }
  return null;
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

    const body: AddMessageRequest = await req.json();

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

    // Verify ticket exists
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .select("id, status")
      .eq("id", body.ticket_id)
      .single();

    if (ticketError || !ticket) {
      return new Response(
        JSON.stringify({ error: "Ticket not found" }),
        {
          status: 404,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Don't allow messages on closed tickets
    if (ticket.status === "closed") {
      return new Response(
        JSON.stringify({ error: "Cannot add messages to closed tickets" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    // Create message
    const { data: message, error: messageError } = await supabaseClient
      .from("messages")
      .insert({
        ticket_id: body.ticket_id,
        sender_id: body.sender_id,
        sender_type: body.sender_type,
        content: body.content,
      })
      .select()
      .single();

    if (messageError) {
      throw messageError;
    }

    // Update ticket's updated_at timestamp
    await supabaseClient
      .from("tickets")
      .update({ updated_at: new Date().toISOString() })
      .eq("id", body.ticket_id);

    return new Response(
      JSON.stringify({
        success: true,
        message: message,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    console.error("Error adding message:", error);
    return new Response(
      JSON.stringify({ error: "Failed to add message" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
