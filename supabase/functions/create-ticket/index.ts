// supabase/functions/create-ticket/index.ts
// Edge Function to create a support ticket
// This function handles ticket creation with input validation

import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization",
};

interface CreateTicketRequest {
  customer_name?: string;
  customer_email?: string;
  subject: string;
  message: string;
  priority?: "low" | "medium" | "high";
  session_id?: string;
}

// Validate email format
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// Validate input
function validateInput(data: CreateTicketRequest): string | null {
  if (!data.subject || data.subject.trim().length === 0) {
    return "Subject is required";
  }
  if (data.subject.length > 500) {
    return "Subject must be less than 500 characters";
  }
  if (!data.message || data.message.trim().length === 0) {
    return "Message is required";
  }
  if (data.message.length > 5000) {
    return "Message must be less than 5000 characters";
  }
  if (data.customer_email && !isValidEmail(data.customer_email)) {
    return "Invalid email format";
  }
  if (data.priority && !["low", "medium", "high"].includes(data.priority)) {
    return "Invalid priority level";
  }
  return null;
}

serve(async (req: Request) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Use service role for admin operations (bypasses RLS)
    const supabaseClient = createClient(
      Deno.env.get("SUPABASE_URL") ?? "",
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
    );

    const body: CreateTicketRequest = await req.json();

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

    // Generate or use provided session ID
    const sessionId = body.session_id || crypto.randomUUID();

    // Check if customer exists or create new one
    let customerId: string;
    const { data: existingCustomer } = await supabaseClient
      .from("customers")
      .select("id")
      .eq("session_id", sessionId)
      .single();

    if (existingCustomer) {
      customerId = existingCustomer.id;
      // Update customer info if provided
      if (body.customer_name || body.customer_email) {
        await supabaseClient
          .from("customers")
          .update({
            name: body.customer_name || existingCustomer.name,
            email: body.customer_email || existingCustomer.email,
            updated_at: new Date().toISOString(),
          })
          .eq("id", customerId);
      }
    } else {
      // Create new customer
      const { data: newCustomer, error: customerError } = await supabaseClient
        .from("customers")
        .insert({
          name: body.customer_name || "Anonymous",
          email: body.customer_email || null,
          session_id: sessionId,
        })
        .select("id")
        .single();

      if (customerError) {
        throw customerError;
      }
      customerId = newCustomer.id;
    }

    // Create ticket
    const { data: ticket, error: ticketError } = await supabaseClient
      .from("tickets")
      .insert({
        customer_id: customerId,
        subject: body.subject,
        priority: body.priority || "medium",
        status: "pending",
      })
      .select()
      .single();

    if (ticketError) {
      throw ticketError;
    }

    // Create initial message
    const { error: messageError } = await supabaseClient
      .from("messages")
      .insert({
        ticket_id: ticket.id,
        sender_id: customerId,
        sender_type: "customer",
        content: body.message,
      });

    if (messageError) {
      throw messageError;
    }

    return new Response(
      JSON.stringify({
        success: true,
        ticket_id: ticket.id,
        session_id: sessionId,
      }),
      {
        status: 201,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    let errorMessage = "Failed to create ticket";
    
    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === 'object' && error !== null) {
      errorMessage = JSON.stringify(error);
    } else if (typeof error === 'string') {
      errorMessage = error;
    }
    
    console.error("Error creating ticket:", errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
