console.log("Job AI Finder: content.js injected successfully!");

const API_URL = "https://job-ai-backend.tanya.workers.dev"; // Your worker URL

function showCustomPopup(data, jobTitle, jobCompany, jobDescription) {
  const existing = document.getElementById("job-ai-custom-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "job-ai-custom-popup";
  
  const scoreColor = data.score >= 4 ? "#10b981" : data.score >= 3 ? "#f59e0b" : "#ef4444";

  popup.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 30px;
    z-index: 2147483647;
    background: white;
    border-radius: 16px;
    padding: 24px;
    width: 340px;
    box-shadow: 0 10px 30px rgba(0,0,0,0.15);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    border: 1px solid #e2e8f0;
  `;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: 800; color: #0f172a;">✨ AI Analysis</h3>
      <button id="job-ai-close-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; color: #94a3b8; transition: color 0.2s;">&times;</button>
    </div>
    
    <div style="margin-bottom: 16px; display: flex; justify-content: space-between; align-items: center; background: #f8fafc; padding: 12px; border-radius: 12px;">
      <span style="font-size: 13px; color: #475569; font-weight: 700; text-transform: uppercase;">Match Score</span>
      <div style="font-size: 28px; font-weight: 900; color: ${scoreColor};">${data.score}<span style="font-size: 18px; color: #94a3b8;">/5</span></div>
    </div>
    
    <div style="margin-bottom: 16px;">
      <span style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Summary</span>
      <p style="margin: 4px 0 0 0; font-size: 14px; line-height: 1.5; color: #334155;">${data.summary || "No summary provided."}</p>
    </div>
    
    <div>
      <span style="font-size: 12px; color: #64748b; font-weight: 700; text-transform: uppercase;">Missing Skills</span>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #ef4444; font-weight: 600;">
        ${data.missing_skills && data.missing_skills.length > 0 ? data.missing_skills.join(", ") : "None! Perfect match 🎉"}
      </p>
    </div>
    
    <button id="job-ai-save-btn" style="margin-top: 20px; width: 100%; padding: 12px; background: #f1f5f9; border: 1px solid #cbd5e1; border-radius: 8px; font-weight: 700; color: #334155; cursor: pointer; transition: 0.2s; font-size: 14px;">
      💾 Save to Dashboard
    </button>
  `;

  document.body.appendChild(popup);

  // Close Button Logic
  document.getElementById("job-ai-close-btn").addEventListener("click", () => {
    popup.remove();
  });
  
  // Close on mouse hover for the X
  document.getElementById("job-ai-close-btn").addEventListener("mouseover", (e) => e.target.style.color = "#0f172a");
  document.getElementById("job-ai-close-btn").addEventListener("mouseout", (e) => e.target.style.color = "#94a3b8");

  // Save to Dashboard Logic
  document.getElementById("job-ai-save-btn").addEventListener("click", async (e) => {
    const btn = e.target;
    btn.innerText = "⏳ Saving...";
    try {
      await fetch(`${API_URL}/save-job`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: jobTitle,
          company: jobCompany,
          description: jobDescription,
          score: data.score,
          summary: data.summary,
          missing_skills: data.missing_skills
        })
      });
      btn.innerText = "✅ Saved Successfully!";
      btn.style.background = "#d1fae5";
      btn.style.color = "#065f46";
      btn.style.borderColor = "#10b981";
    } catch (err) {
      btn.innerText = "❌ Error Saving";
    }
  });
}

function injectFloatingButton() {
  if (document.getElementById("job-ai-floating-btn")) return;

  const btn = document.createElement("button");
  btn.id = "job-ai-floating-btn";
  btn.innerText = "⭐ Analyze Job with AI";
  
  btn.style.cssText = `
    position: fixed;
    bottom: 30px;
    left: 30px;
    z-index: 2147483647; 
    background: #10b981;
    color: white;
    border: none;
    padding: 16px 24px;
    border-radius: 50px;
    font-weight: bold;
    font-size: 16px;
    cursor: pointer;
    box-shadow: 0 4px 15px rgba(0,0,0,0.3);
    transition: transform 0.2s ease, background 0.2s;
  `;

  btn.addEventListener("mouseover", () => {
    btn.style.transform = "scale(1.05)";
    btn.style.background = "#059669";
  });
  btn.addEventListener("mouseout", () => {
    btn.style.transform = "scale(1)";
    btn.style.background = "#10b981";
  });

  btn.addEventListener("click", async () => {
    btn.innerText = "⏳ Analyzing...";
    
    // Attempt to scrape Job Title and Company from LinkedIn DOM
    const titleEl = document.querySelector('.job-details-jobs-unified-top-card__job-title') || document.querySelector('h1');
    const companyEl = document.querySelector('.job-details-jobs-unified-top-card__company-name') || document.querySelector('.jobs-unified-top-card__company-name') || document.querySelector('.app-aware-link');
    
    const jobTitle = titleEl ? titleEl.innerText.trim() : "LinkedIn Job";
    const jobCompany = companyEl ? companyEl.innerText.trim() : "Unknown Company";

    const descElement = document.querySelector('#job-details') || 
                        document.querySelector('.jobs-description') || 
                        document.querySelector('.jobs-description-content__text') ||
                        document.querySelector('article');

    const jobDescription = descElement ? descElement.innerText : document.body.innerText.substring(0, 3000);

    chrome.storage.local.get(["skills"], async (result) => {
      const skills = result.skills || "";
      if (!skills) {
        alert("Please open the extension popup in the top right and add your skills first!");
        btn.innerText = "⭐ Analyze Job with AI";
        return;
      }

      try {
        const response = await fetch(`${API_URL}/analyze`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ skills, jobDescription })
        });
        
        const data = await response.json();
        
        showCustomPopup(data, jobTitle, jobCompany, jobDescription);
        
        btn.innerText = "⭐ Analyze Job with AI";
      } catch (err) {
        alert("Error analyzing job. Make sure your Worker is running.");
        btn.innerText = "⭐ Analyze Job with AI";
      }
    });
  });

  document.body.appendChild(btn);
}

setInterval(injectFloatingButton, 2000);