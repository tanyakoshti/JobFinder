const API_URL = "https://job-ai-backend.tanya.workers.dev"; // Replace with your actual URL

function injectButton() {
  // If the button is already there, don't add another one
  if (document.getElementById("job-ai-analyze-btn")) return;

  // Check all the different CSS classes LinkedIn uses for the Apply button container
  const actionContainer = document.querySelector('.jobs-apply-button--top-card') || 
                          document.querySelector('.jobs-s-apply') ||
                          document.querySelector('.jobs-unified-top-card__action-buttons') ||
                          document.querySelector('.job-details-jobs-unified-top-card__action-buttons') ||
                          document.querySelector('.jobs-details-top-card__actions');

  if (actionContainer) {
    const btn = document.createElement("button");
    btn.id = "job-ai-analyze-btn";
    btn.innerText = "⭐ Analyze Job";
    btn.style.cssText = `
      background: #10b981; color: white; border: none; 
      padding: 8px 16px; border-radius: 20px; font-weight: 600; 
      cursor: pointer; margin-left: 10px; font-size: 16px;
      display: inline-flex; align-items: center; justify-content: center;
      min-height: 32px;
    `;

    btn.addEventListener("click", async () => {
      btn.innerText = "⏳ Analyzing...";
      
      const descElement = document.querySelector('#job-details') || 
                          document.querySelector('.jobs-description') || 
                          document.querySelector('.jobs-description-content__text');
                          
      const jobDescription = descElement ? descElement.innerText : "No description found.";

      chrome.storage.local.get(["skills"], async (result) => {
        const skills = result.skills || "";
        if (!skills) {
          alert("Please open the extension popup and add your skills first!");
          btn.innerText = "⭐ Analyze Job";
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
          btn.innerText = "⭐ Analyze Job";
        } catch (err) {
          alert("Error analyzing job. Check console.");
          btn.innerText = "⭐ Analyze Job";
        }
      });
    });

    actionContainer.appendChild(btn);
  }
}

setInterval(injectButton, 1500);