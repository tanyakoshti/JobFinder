console.log("Job AI Finder: content.js injected successfully!");

const API_URL = "https://job-ai-backend.tanya.workers.dev"; // Your worker URL

function showCustomPopup(data) {
  // Remove existing popup if it's already there
  const existing = document.getElementById("job-ai-custom-popup");
  if (existing) existing.remove();

  const popup = document.createElement("div");
  popup.id = "job-ai-custom-popup";
  
  // Determine color based on score
  const scoreColor = data.score >= 4 ? "#10b981" : data.score >= 3 ? "#f59e0b" : "#ef4444";

  popup.style.cssText = `
    position: fixed;
    bottom: 90px;
    left: 30px;
    z-index: 2147483647;
    background: white;
    border-radius: 12px;
    padding: 24px;
    width: 320px;
    box-shadow: 0 10px 25px rgba(0,0,0,0.2);
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    border: 1px solid #e2e8f0;
  `;

  popup.innerHTML = `
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px;">
      <h3 style="margin: 0; font-size: 18px; font-weight: bold; color: #0f172a;">AI Analysis</h3>
      <button id="job-ai-close-btn" style="background: none; border: none; font-size: 18px; cursor: pointer; color: #64748b;">&times;</button>
    </div>
    
    <div style="margin-bottom: 16px;">
      <span style="font-size: 14px; color: #64748b; font-weight: 600;">Match Score</span>
      <div style="font-size: 32px; font-weight: 800; color: ${scoreColor};">${data.score}/5</div>
    </div>
    
    <div style="margin-bottom: 16px;">
      <span style="font-size: 14px; color: #64748b; font-weight: 600;">Summary</span>
      <p style="margin: 4px 0 0 0; font-size: 14px; line-height: 1.4;">${data.summary || "No summary provided."}</p>
    </div>
    
    <div>
      <span style="font-size: 14px; color: #64748b; font-weight: 600;">Missing Skills</span>
      <p style="margin: 4px 0 0 0; font-size: 14px; color: #ef4444; font-weight: 500;">
        ${data.missing_skills && data.missing_skills.length > 0 ? data.missing_skills.join(", ") : "None! Perfect match."}
      </p>
    </div>
  `;

  document.body.appendChild(popup);

  document.getElementById("job-ai-close-btn").addEventListener("click", () => {
    popup.remove();
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
    box-shadow: 0 4px 15px rgba(0,0,0,0.4);
    transition: transform 0.2s ease;
  `;

  btn.addEventListener("mouseover", () => btn.style.transform = "scale(1.05)");
  btn.addEventListener("mouseout", () => btn.style.transform = "scale(1)");

  btn.addEventListener("click", async () => {
    btn.innerText = "⏳ Analyzing...";
    
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
        
        // Show our beautiful custom popup instead of the native alert!
        showCustomPopup(data);
        
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