
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY');
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, userProfile, otherUserProfile } = await req.json();
    
    // Create a system message with context about the users if available
    let systemMessage = "You are a helpful AI dating assistant. Your goal is to provide advice, suggestions, and conversation starters to help people connect better.";
    
    if (userProfile && otherUserProfile) {
      systemMessage += ` You're helping ${userProfile.name} chat with ${otherUserProfile.name}.`;
      
      if (otherUserProfile.bio) {
        systemMessage += ` ${otherUserProfile.name}'s bio says: "${otherUserProfile.bio}".`;
      }
      
      if (otherUserProfile.location) {
        systemMessage += ` They are from ${otherUserProfile.location}.`;
      }
    }
    
    // Add the system message to the beginning of the messages array
    const completeMessages = [
      { role: "system", content: systemMessage },
      ...messages
    ];

    console.log("Sending request to Groq API with messages:", JSON.stringify(completeMessages));

    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192", // Using Llama 3 8B model
        messages: completeMessages,
        temperature: 0.7,
        max_tokens: 800
      })
    });

    const data = await response.json();
    console.log("Groq API response:", JSON.stringify(data));

    if (!response.ok) {
      throw new Error(`Groq API error: ${data.error?.message || response.statusText}`);
    }

    return new Response(JSON.stringify({
      message: data.choices[0].message.content,
      model: data.model
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  } catch (error) {
    console.error("Error in AI dating assistant:", error);
    return new Response(JSON.stringify({
      error: error.message || "An error occurred with the AI assistant"
    }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" }
    });
  }
});
