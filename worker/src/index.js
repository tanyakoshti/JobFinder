export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const method = request.method;

    // CORS Headers
    const corsHeaders = {
      "Access-Control-Allow-Origin": "*",
      "Access-Control-Allow-Methods": "GET, POST, PATCH, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type",
    };

    if (method === "OPTIONS") {
      return new Response(null, { headers: corsHeaders });
    }

    try {
      // POST /analyze
      if (url.pathname === "/analyze" && method === "POST") {
        const { jobDescription, skills } = await request.json();
        
        const aiResponse = await fetch("https://openrouter.ai/api/v1/chat/completions", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${env.OPENROUTER_API_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            model: "mistralai/mistral-7b-instruct",
            response_format: { type: "json_object" },
            messages: [{
              role: "system",
              content: "You are an AI job analyzer. Return ONLY JSON with: score (1-5 number), summary (string), missing_skills (array of strings)."
            }, {
              role: "user",
              content: `User Skills: ${skills}\nJob Description: ${jobDescription}`
            }]
          })
        });
        
        const data = await aiResponse.json();
        const result = JSON.parse(data.choices[0].message.content);
        return new Response(JSON.stringify(result), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // POST /save-job
      if (url.pathname === "/save-job" && method === "POST") {
        const jobData = await request.json();
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/jobs`, {
          method: "POST",
          headers: {
            "apikey": env.SUPABASE_KEY,
            "Authorization": `Bearer ${env.SUPABASE_KEY}`,
            "Content-Type": "application/json",
            "Prefer": "return=representation"
          },
          body: JSON.stringify(jobData)
        });
        const saved = await res.json();
        return new Response(JSON.stringify(saved), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // GET /jobs
      if (url.pathname === "/jobs" && method === "GET") {
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/jobs?select=*&order=score.desc`, {
          headers: { "apikey": env.SUPABASE_KEY, "Authorization": `Bearer ${env.SUPABASE_KEY}` }
        });
        const jobs = await res.json();
        return new Response(JSON.stringify(jobs), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // PATCH /job-status
      if (url.pathname === "/job-status" && method === "PATCH") {
        const { id, status } = await request.json();
        const res = await fetch(`${env.SUPABASE_URL}/rest/v1/jobs?id=eq.${id}`, {
          method: "PATCH",
          headers: {
            "apikey": env.SUPABASE_KEY,
            "Authorization": `Bearer ${env.SUPABASE_KEY}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify({ status })
        });
        return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      return new Response("Not found", { status: 404, headers: corsHeaders });
    } catch (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: corsHeaders });
    }
  }
};