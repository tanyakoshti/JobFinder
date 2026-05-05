# ✨ Job AI Finder

**Job AI Finder** is a powerful Chrome Extension that acts as your personal AI job-hunting assistant. It automatically reads job descriptions on LinkedIn, compares them against your skill set, and gives you an instant match score. It also acts as a tracker, allowing you to save jobs and track your application status in a personalized dashboard.

## 🚀 Purpose
Applying for jobs is tedious. It's hard to tell at a glance if you actually meet a company's requirements hidden in walls of text. This tool leverages LLMs (Large Language Models) to:
1. Read the verbose job description.
2. Cross-reference it with your specific technical skills.
3. Provide a clear Score (out of 5), a brief summary, and a list of **missing skills**.
4. Save the job to a personal database so you can track your application pipeline.

## 🛠️ How It Works
The architecture is completely serverless and highly secure:
1. **Chrome Extension (Frontend):** Injects a floating UI button into LinkedIn. When clicked, it scrapes the job description, title, and company, then sends it to the backend.
2. **Cloudflare Workers (Backend):** Acts as a secure proxy to hide your API keys. It receives the job data and user skills.
3. **OpenRouter AI (Intelligence):** The worker forwards the prompt to an LLM via OpenRouter, which analyzes the text and returns structured JSON (score, summary, missing skills).
4. **Supabase (Database):** When you click "Save to Dashboard", the worker securely saves the job details, AI analysis, and application status into a PostgreSQL database.

## ⚙️ Tech Stack
* **Frontend:** Vanilla JavaScript, HTML, CSS (Chrome Extension V3)
* **Backend:** Cloudflare Workers (Serverless)
* **AI:** OpenRouter API
* **Database:** Supabase (PostgreSQL)

## 📋 Setup & Installation

### 1. Database Setup (Supabase)
1. Create a free account at [Supabase](https://supabase.com/).
2. Create a new project.
3. Go to the **SQL Editor** and run the following query to create your database table:
   ```sql
   CREATE TABLE jobs (
       id SERIAL PRIMARY KEY,
       title TEXT NOT NULL,
       company TEXT NOT NULL,
       description TEXT,
       score INTEGER,
       summary TEXT,
       missing_skills JSONB,
       status TEXT DEFAULT 'saved',
       created_at TIMESTAMP DEFAULT NOW()
   );
   
   -- Disable Row Level Security (RLS) for the MVP so the worker can write to it
   ALTER TABLE jobs DISABLE ROW LEVEL SECURITY;
   ```
4. Go to **Project Settings -> API** and copy your `Project URL` and `anon public` API key.

### 2. Backend Setup (Cloudflare Workers)
1. Install Wrangler CLI globally: `npm install -g wrangler`
2. Navigate to your worker folder (or initialize a new one with `npx wrangler init`).
3. Create an account at [OpenRouter](https://openrouter.ai/) and get an API Key.
4. Add your secrets to your Cloudflare Worker:
   ```bash
   npx wrangler secret put OPENROUTER_API_KEY
   npx wrangler secret put SUPABASE_URL
   npx wrangler secret put SUPABASE_KEY
   ```
5. Deploy the worker: `npx wrangler deploy`
6. Copy the deployed Worker URL (e.g., `https://job-ai-backend.<your-username>.workers.dev`).

### 3. Extension Setup
1. Clone this repository to your local machine.
2. Open `extension/content.js`, `extension/popup.js`, and `extension/dashboard.js` in a code editor.
3. Replace the `API_URL` variable at the top of those files with your deployed Cloudflare Worker URL.
4. Open Google Chrome and navigate to `chrome://extensions/`.
5. Enable **Developer mode** (toggle in the top right corner).
6. Click **Load unpacked** and select the `extension` folder from this repository.

## 💡 Usage
1. Click the **Job AI Finder** extension icon in your browser toolbar.
2. Enter your technical skills (e.g., "React, Node.js, Python, AWS") and click **💾 Save Skills**.
3. Navigate to [LinkedIn Jobs](https://www.linkedin.com/jobs/).
4. Click on any job posting.
5. Click the green **⭐ Analyze Job with AI** floating button in the bottom left corner of the screen.
6. Review your match score! Click **💾 Save to Dashboard** to keep track of the job.
7. Click the **Dashboard** icon (📊) in the extension popup to view and manage all your saved jobs and update their statuses (Applied, Interviewing, Rejected).