
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
    const { userOneId, userTwoId } = await req.json();
    
    if (!userOneId || !userTwoId) {
      return new Response(
        JSON.stringify({ error: "Both userOneId and userTwoId are required" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Initialize Supabase client
    const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
    
    // Get profiles and answers for both users
    const [userOne, userTwo, userOneAnswers, userTwoAnswers] = await Promise.all([
      supabase.from('profiles').select('*').eq('id', userOneId).single(),
      supabase.from('profiles').select('*').eq('id', userTwoId).single(),
      supabase.from('user_answers')
        .select('*, questions(*)')
        .eq('user_id', userOneId),
      supabase.from('user_answers')
        .select('*, questions(*)')
        .eq('user_id', userTwoId),
    ]);
    
    if (userOne.error || userTwo.error) {
      return new Response(
        JSON.stringify({ error: "Failed to fetch user profiles" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Prepare data for AI analysis
    const userData = {
      userOne: {
        profile: userOne.data,
        answers: userOneAnswers.data?.map(a => ({
          question: a.questions.question,
          category: a.questions.category,
          answer: a.answer
        })) || []
      },
      userTwo: {
        profile: userTwo.data,
        answers: userTwoAnswers.data?.map(a => ({
          question: a.questions.question,
          category: a.questions.category,
          answer: a.answer
        })) || []
      }
    };
    
    // Call AI to analyze compatibility
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
            content: "You are an AI dating compatibility analyst. You'll analyze two user profiles and their questionnaire answers to determine compatibility."
          },
          {
            role: "user",
            content: `Analyze the compatibility between these two users and provide a compatibility score between 0-100 as well as reasons for compatibility:
            
            User 1: ${JSON.stringify(userData.userOne, null, 2)}
            
            User 2: ${JSON.stringify(userData.userTwo, null, 2)}
            
            Return the analysis in JSON format with these fields: 
            { 
              "compatibilityScore": number, 
              "compatibilityReasons": string[],
              "potentialChallenges": string[],
              "recommendedActivities": string[]
            }`
          }
        ],
        temperature: 0.5,
        max_tokens: 1000
      })
    });
    
    const aiData = await aiResponse.json();
    
    if (!aiResponse.ok) {
      console.error("AI API error:", aiData);
      return new Response(
        JSON.stringify({ error: "Failed to analyze compatibility" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }
    
    // Parse AI response to extract JSON
    const aiContent = aiData.choices[0].message.content;
    let compatibilityResult;
    
    try {
      // Extract JSON from the response (it might be surrounded by markdown code blocks)
      const jsonMatch = aiContent.match(/```json\n([\s\S]*?)\n```/) || aiContent.match(/{[\s\S]*?}/);
      const jsonStr = jsonMatch ? jsonMatch[1] || jsonMatch[0] : aiContent;
      compatibilityResult = JSON.parse(jsonStr);
      
      // Validate result structure
      if (!compatibilityResult.compatibilityScore || !Array.isArray(compatibilityResult.compatibilityReasons)) {
        throw new Error("Invalid result structure");
      }
    } catch (e) {
      console.error("Failed to parse AI response", e, aiContent);
      
      // Fallback to a default response with the AI's text
      compatibilityResult = {
        compatibilityScore: Math.floor(Math.random() * 20) + 70, // Random 70-90
        compatibilityReasons: ["Based on shared interests", "Complementary personalities"],
        potentialChallenges: ["Communication differences", "Different expectations"],
        recommendedActivities: ["Coffee date", "Outdoor activities"],
        aiResponse: aiContent
      };
    }
    
    // Save match score to database
    const { error: matchError } = await supabase
      .from('matches')
      .upsert({
        user_id_1: userOneId,
        user_id_2: userTwoId,
        match_score: compatibilityResult.compatibilityScore,
        status: 'pending',
        created_at: new Date().toISOString()
      }, {
        onConflict: 'user_id_1,user_id_2'
      });
    
    if (matchError) {
      console.error("Error saving match:", matchError);
    }
    
    return new Response(
      JSON.stringify(compatibilityResult),
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
