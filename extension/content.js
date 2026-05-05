console.log("Job AI Finder: content.js injected successfully!");

const API_URL = "https://job-ai-backend.tanya.workers.dev"; // Your worker URL

function injectFloatingButton() {
  if (document.getElementById("job-ai-floating-btn")) return;

  // We are removing the check for the job description. 
  // We will force the button to render no matter what to prove the extension is working.

  const btn = document.createElement("button");
  btn.id = "job-ai-floating-btn";
  btn.innerText = "⭐ Analyze Job with AI";
  
  // Placed on the BOTTOM LEFT so LinkedIn's chat box doesn't cover it
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
  `;

  btn.addEventListener("click", async () => {
    btn.innerText = "⏳ Analyzing...";
    
    // Look for the job description. If we can't find it, just grab all the text on the screen as a fallback
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
        alert(`Score: ${data.score}/5\n\nMissing Skills:\n${data.missing_skills.join(", ")}`);
        btn.innerText = "⭐ Analyze Job with AI";
      } catch (err) {
        alert("Error analyzing job. Make sure your Worker is running.");
        btn.innerText = "⭐ Analyze Job with AI";
      }
    });
  });

  document.body.appendChild(btn);
  console.log("Job AI Finder: Button injected onto the page!");
}

// Try to inject it every 2 seconds unconditionally
setInterval(injectFloatingButton, 2000);