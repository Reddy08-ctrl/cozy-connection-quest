
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.7.1";

const SUPABASE_URL = Deno.env.get('SUPABASE_URL')!;
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY')!;
const GROQ_API_KEY = Deno.env.get('GROQ_API_KEY')!;
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
    const { userId, otherUserId } = await req.json();
    
    if (!userId || !otherUserId) {
      return new Response(
        JSON.stringify({ error: "Both userId and otherUserId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get messages between users
    const { data: messages, error: messagesError } = await supabase
      .from('messages')
      .select('*')
      .or(`and(sender_id.eq.${userId},receiver_id.eq.${otherUserId}),and(sender_id.eq.${otherUserId},receiver_id.eq.${userId})`)
      .order('created_at', { ascending: true });
    
    if (messagesError) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch messages", details: messagesError }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    if (!messages || messages.length === 0) {
      return new Response(
        JSON.stringify({ 
          analysis: "Not enough conversation data to analyze.",
          suggestions: ["Start a conversation by asking about their interests.", "Share something about yourself to encourage reciprocation."]
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Get user profiles
    const [userProfile, otherUserProfile] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userId).single(),
      supabase.from('profiles').select('*').eq('id', otherUserId).single()
    ]);
    
    // Format messages for AI
    const formattedConversation = messages.map(msg => ({
      speaker: msg.sender_id === userId ? "You" : "Other",
      message: msg.content,
      timestamp: msg.created_at
    }));
    
    // Call AI to analyze conversation
    const aiResponse = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`
      },
      body: JSON.stringify({
        model: "llama3-8b-8192",
        messages: [
          {
            role: "system",
            content: "You are an AI dating conversation coach. You'll analyze conversations between two people who are in the early stages of dating, and provide helpful insights."
          },
          {
            role: "user",
            content: `Analyze this conversation between two people who are dating and provide insights:
            
            User profiles:
            You: ${JSON.stringify(userProfile.data, null, 2)}
            Other person: ${JSON.stringify(otherUserProfile.data, null, 2)}
            
            Conversation:
            ${JSON.stringify(formattedConversation, null, 2)}
            
            Provide:
            1. An analysis of the conversation flow and engagement
            2. Potential conversation topics based on shared interests
            3. Suggestions for how to improve the conversation
            4. When it might be appropriate to suggest meeting in person
            
            Return your analysis in JSON format with these fields:
            {
              "conversationQuality": string,
              "engagementLevel": string,
              "suggestedTopics": string[],
              "improvementTips": string[],
              "readinessForMeeting": string
            }`
          }
        ],
        temperature: 0.7,
        max_tokens: 1000
      })
    });
    
    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
      console.error("AI API error:", aiData);
      return new Response(
        JSON.stringify({ error: "Failed to analyze conversation" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse AI response to extract JSON
    const aiContent = aiData.choices[0].message.content;
    let analysisResult;
    
    try {
      // Extract JSON from the response (it might be surrounded by markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/{[\s\S]*?}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent;
      analysisResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response", e, aiContent);
      
      // Fallback to a simpler response format with the raw AI text
      analysisResult = {
        analysis: "Analysis could not be structured properly.",
        rawAnalysis: aiContent,
        suggestedTopics: ["Ask about their hobbies", "Share a recent experience", "Discuss favorite places"]
      };
    }
    
    return new Response(
      JSON.stringify(analysisResult),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error", details: error.message }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
