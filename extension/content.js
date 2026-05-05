const API_URL = "YOUR_CLOUDFLARE_WORKER_URL";

function injectAnalyzeButton() {
  if (document.getElementById('ai-analyze-btn')) return;
  
  const actionsContainer = document.querySelector('.jobs-save-and-apply-row');
  if (!actionsContainer) return;

  const btn = document.createElement('button');
  btn.id = 'ai-analyze-btn';
  btn.innerText = '⭐ Analyze Job';
  btn.className = 'ai-btn artdeco-button artdeco-button--2 artdeco-button--primary';
  
  btn.onclick = async () => {
    btn.innerText = 'Analyzing...';
    
    // Extract Job Data
    const title = document.querySelector('h1').innerText;
    const company = document.querySelector('.jobs-unified-top-card__company-name').innerText;
    const description = document.querySelector('.jobs-description-content__text').innerText;
    
    chrome.storage.local.get(['userSkills'], async (res) => {
      const skills = res.userSkills || "JavaScript, React, Node.js"; // Fallback
      try {
        const response = await fetch(`${API_URL}/analyze`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ jobDescription: description, skills })
        });
        const data = await response.json();
        showOverlay(title, company, description, data);
      } catch (err) {
        alert("Error analyzing.");
      }
      btn.innerText = '⭐ Analyze Job';
    });
  };
  
  actionsContainer.appendChild(btn);
}

function showOverlay(title, company, description, data) {
  const overlay = document.createElement('div');
  overlay.className = 'ai-overlay';
  overlay.innerHTML = `
    <div class="ai-overlay-content">
      <h3>${title} @ ${company}</h3>
      <div class="score ${data.score >= 4 ? 'green' : data.score >= 3 ? 'yellow' : 'red'}">${data.score}/5 Match</div>
      <p>${data.summary}</p>
      <p><strong>Missing:</strong> ${data.missing_skills.join(', ')}</p>
      <button id="ai-save-btn">💾 Save Job</button>
      <button onclick="this.parentElement.parentElement.remove()">Close</button>
    </div>
  `;
  document.body.appendChild(overlay);

  document.getElementById('ai-save-btn').onclick = async () => {
    await fetch(`${API_URL}/save-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, company, description, score: data.score, summary: data.summary, missing_skills: data.missing_skills, status: 'saved' })
    });
    overlay.remove();
    alert('Job Saved to Dashboard!');
  };
}

// Observe LinkedIn dynamic changes
const observer = new MutationObserver(() => injectAnalyzeButton());
observer.observe(document.body, { childList: true, subtree: true });