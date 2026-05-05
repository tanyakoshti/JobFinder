const API_URL = "https://job-ai-backend.tanya.workers.dev";

document.addEventListener('DOMContentLoaded', () => {
  chrome.storage.local.get(['skills'], (result) => {
    if (result.skills) {
      document.getElementById('skills').value = result.skills;
    }
  });
});

document.getElementById('dashboard-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard.html' });
});

document.getElementById('save-skills-btn').addEventListener('click', () => {
  const skills = document.getElementById('skills').value;
  if (!skills) return alert('Please enter some skills first!');
  
  chrome.storage.local.set({ skills: skills }, () => {
    const btn = document.getElementById('save-skills-btn');
    btn.innerText = "✅ Saved!";
    btn.style.background = "#059669";
    setTimeout(() => {
      btn.innerText = "💾 Save Skills";
      btn.style.background = "#10b981";
    }, 2000);
  });
});

document.getElementById('analyze-btn').addEventListener('click', async () => {
  const skills = document.getElementById('skills').value;
  const desc = document.getElementById('job-desc').value;
  const btn = document.getElementById('analyze-btn');
  
  if (!skills) return alert('Please enter your skills');
  if (!desc) return alert('Please paste a job description');
  
  chrome.storage.local.set({ skills: skills });
  
  btn.innerText = 'Analyzing...';
  try {
    const res = await fetch(`${API_URL}/analyze`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ jobDescription: desc, skills })
    });
    const data = await res.json();
    
    document.getElementById('result').classList.remove('hidden');
    const scoreEl = document.getElementById('score');
    scoreEl.innerText = `${data.score}/5`;
    scoreEl.className = `score-badge ${data.score >= 4 ? 'green' : data.score >= 3 ? 'yellow' : 'red'}`;
    
    document.getElementById('summary').innerText = data.summary;
    document.getElementById('missing').innerText = data.missing_skills.join(', ') || "None!";
    
    const saveBtn = document.getElementById('save-btn');
    saveBtn.onclick = () => saveJob({ title: "Manual Entry", company: "Unknown", description: desc, ...data }, saveBtn);
  } catch (e) {
    alert('Error analyzing job');
  }
  btn.innerText = 'Analyze Manual Job';
});

async function saveJob(data, btnElement) {
  btnElement.innerText = "⏳ Saving...";
  try {
    await fetch(`${API_URL}/save-job`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    });
    btnElement.innerText = "✅ Saved!";
    btnElement.style.background = "#d1fae5";
    btnElement.style.color = "#065f46";
  } catch(e) {
    btnElement.innerText = "❌ Error Saving";
  }
}