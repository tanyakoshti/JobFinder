const API_URL = "https://job-ai-backend.tanya.workers.dev"; // Updated to match your worker URL

// Load saved skills when the popup opens
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

document.getElementById('analyze-btn').addEventListener('click', async () => {
  const skills = document.getElementById('skills').value;
  const desc = document.getElementById('job-desc').value;
  const btn = document.getElementById('analyze-btn');
  
  if (!skills) return alert('Please enter your skills');
  
  // SAVE SKILLS TO STORAGE so the LinkedIn button can use them!
  chrome.storage.local.set({ skills: skills });
  
  if (!desc) return alert('Please enter a job description');
  
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
    scoreEl.innerText = `Score: ${data.score}/5`;
    scoreEl.className = `score-badge ${data.score >= 4 ? 'green' : data.score >= 3 ? 'yellow' : 'red'}`;
    
    document.getElementById('summary').innerText = data.summary;
    document.getElementById('missing').innerText = data.missing_skills.join(', ');
    
    const saveBtn = document.getElementById('save-btn');
    saveBtn.classList.remove('hidden');
    saveBtn.onclick = () => saveJob({ title: "Manual Entry", company: "Unknown", description: desc, ...data });
  } catch (e) {
    alert('Error analyzing job');
  }
  btn.innerText = 'Analyze Job';
});

async function saveJob(data) {
  await fetch(`${API_URL}/save-job`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data)
  });
  alert('Saved successfully!');
}