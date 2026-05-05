const API_URL = "YOUR_CLOUDFLARE_WORKER_URL";

document.getElementById('dashboard-btn').addEventListener('click', () => {
  chrome.tabs.create({ url: 'dashboard.html' });
});

document.getElementById('analyze-btn').addEventListener('click', async () => {
  const skills = document.getElementById('skills').value;
  const desc = document.getElementById('job-desc').value;
  const btn = document.getElementById('analyze-btn');
  
  if (!skills || !desc) return alert('Fill all fields');
  
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