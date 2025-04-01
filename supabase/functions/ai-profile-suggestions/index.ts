
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
    const { userId, currentProfile } = await req.json();
    
    if (!userId) {
      return new Response(
        JSON.stringify({ error: "userId is required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get user profile if not provided
    let profile = currentProfile;
    if (!profile) {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) {
        return new Response(
          JSON.stringify({ error: "Failed to fetch user profile", details: error }),
          { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      
      profile = data;
    }
    
    // Get user answers to questionnaire
    const { data: answers, error: answersError } = await supabase
      .from('user_answers')
      .select('*, questions(*)')
      .eq('user_id', userId);
    
    if (answersError) {
      console.error("Error fetching answers:", answersError);
    }
    
    // Format profile data for AI
    const profileData = {
      profile,
      answers: answers?.map(a => ({
        question: a.questions.question,
        category: a.questions.category,
        answer: a.answer
      })) || []
    };
    
    // Call AI to analyze profile and provide suggestions
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
            content: "You are an AI dating profile consultant. You'll analyze a user's dating profile and questionnaire answers to provide helpful suggestions for improvement."
          },
          {
            role: "user",
            content: `Analyze this dating profile and provide suggestions for improvement:
            
            Profile: ${JSON.stringify(profileData, null, 2)}
            
            Provide:
            1. An analysis of the current profile strengths
            2. Suggestions for improving the bio
            3. Recommendations for additional interests or topics to mention
            4. Tips for better questionnaire answers
            
            Return your analysis in JSON format with these fields:
            {
              "profileStrengths": string[],
              "bioSuggestions": string,
              "interestSuggestions": string[],
              "answerTips": string[],
              "overallImpression": string
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
        JSON.stringify({ error: "Failed to analyze profile" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse AI response to extract JSON
    const aiContent = aiData.choices[0].message.content;
    let suggestionsResult;
    
    try {
      // Extract JSON from the response (it might be surrounded by markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/{[\s\S]*?}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent;
      suggestionsResult = JSON.parse(jsonStr);
    } catch (e) {
      console.error("Failed to parse AI response", e, aiContent);
      
      // Fallback to a simpler response
      suggestionsResult = {
        analysis: "Analysis could not be structured properly.",
        suggestions: [
          "Add more detail to your bio to showcase your personality",
          "Include specific interests rather than general ones",
          "Add a friendly, approachable photo",
          "Be more specific in your questionnaire answers"
        ],
        rawAnalysis: aiContent
      };
    }
    
    return new Response(
      JSON.stringify(suggestionsResult),
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
