// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
};

serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { prompt } = await req.json();

    if (!prompt) {
      throw new Error("Prompt is required");
    }

    const OPENAI_API_KEY = Deno.env.get("OPENAI_API_KEY");
    
    if (!OPENAI_API_KEY) {
      throw new Error("OPENAI_API_KEY is not configured in Supabase Secrets.");
    }

    const systemPrompt = `You are an expert boolean search architect for a social listening and media monitoring platform.
Your job is to take a natural language question or request from a user and convert it into a highly optimized, structured search query.

Instructions:
1. "query": Expand the intent into a boolean search string using keywords, synonyms, and operators (AND, OR, "", -). If the user asks for a brand, include its common variations.
2. "platforms": Select the most relevant platforms from this exact list: ["twitter", "facebook", "instagram", "tiktok", "linkedin", "reddit", "google_news", "youtube"]. If they don't specify, pick the best 2-3 platforms based on the intent (e.g., professional -> linkedin, news -> google_news/twitter).
3. "dateFrom" & "dateTo": Infer the requested time range. If they ask for "latest", "recent", or don't specify, default to the last 7 days. Return in ISO 8601 format. If dateTo is today, you can leave it blank or use today's date.
4. "entities": Extract the main entities (brands, people) as a list of strings.

Output MUST be a valid JSON object matching this schema:
{
  "query": string,
  "platforms": string[],
  "dateFrom": string,
  "dateTo": string,
  "entities": string[]
}`;

    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: "gpt-4o", // Or gpt-3.5-turbo
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt }
        ],
        response_format: { type: "json_object" },
        temperature: 0.1,
      }),
    });

    if (!response.ok) {
      const err = await response.text();
      throw new Error(`OpenAI Error: ${err}`);
    }

    const data = await response.json();
    const result = JSON.parse(data.choices[0].message.content);

    return new Response(JSON.stringify({ success: true, data: result }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (error) {
    console.error("Error in parse-intent:", error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
