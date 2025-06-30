import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, GET, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "*",
  "Access-Control-Max-Age": "86400",
};

interface PostToMetaRequest {
  account_id: string;
  object_story_id: string;
  page_id?: string;
  name?: string;
}

interface PostToMetaResponse {
  success: boolean;
  creative_id?: string;
  error?: string;
  details?: any;
}

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 204,
      headers: corsHeaders
    });
  }

  try {
    const PICA_SECRET_KEY = Deno.env.get("PICA_SECRET_KEY");
    const PICA_META_CONNECTION_KEY = Deno.env.get("PICA_META_CONNECTION_KEY");

    if (!PICA_SECRET_KEY || !PICA_META_CONNECTION_KEY) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing Pica API credentials. Please configure PICA_SECRET_KEY and PICA_META_CONNECTION_KEY environment variables."
      }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const requestBody: PostToMetaRequest = await req.json();
    
    // Validate required fields
    if (!requestBody.account_id || !requestBody.object_story_id) {
      return new Response(JSON.stringify({
        success: false,
        error: "Missing required fields: account_id and object_story_id are required"
      }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Prepare the request payload for Pica API
    const payload = {
      name: requestBody.name || "CreatorPilot Video Creative",
      object_story_id: requestBody.object_story_id,
      ...(requestBody.page_id && { page_id: requestBody.page_id })
    };

    console.log("Posting to Meta via Pica API:", {
      account_id: requestBody.account_id,
      payload: payload
    });

    // Make request to Pica API
    const picaResponse = await fetch(
      `https://api.picaos.com/v1/passthrough/act/${requestBody.account_id}/adcreatives`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "x-pica-secret": PICA_SECRET_KEY,
          "x-pica-connection-key": PICA_META_CONNECTION_KEY,
        },
        body: JSON.stringify(payload),
      }
    );

    const responseData = await picaResponse.json();

    if (!picaResponse.ok) {
      console.error("Pica API error:", {
        status: picaResponse.status,
        statusText: picaResponse.statusText,
        data: responseData
      });

      return new Response(JSON.stringify({
        success: false,
        error: `Meta API error (${picaResponse.status}): ${responseData.error?.message || picaResponse.statusText}`,
        details: responseData
      }), {
        status: picaResponse.status,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log("Meta creative created successfully:", responseData);

    return new Response(JSON.stringify({
      success: true,
      creative_id: responseData.id,
      details: responseData
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error posting to Meta:", error);
    
    return new Response(JSON.stringify({
      success: false,
      error: error.message || "Failed to post to Meta",
      details: error
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});