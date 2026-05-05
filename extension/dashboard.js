const API_URL = "YOUR_CLOUDFLARE_WORKER_URL";

async function loadJobs() {
  const res = await fetch(`${API_URL}/jobs`);
  const jobs = await res.json();
  const container = document.getElementById('job-list');
  
  container.innerHTML = jobs.map(job => `
    <div class="job-card">
      <h3>${job.title}</h3>
      <h4>${job.company}</h4>
      <div class="score-badge ${job.score >= 4 ? 'green' : job.score >= 3 ? 'yellow' : 'red'}">Score: ${job.score}</div>
      <p>${job.summary}</p>
      <select onchange="updateStatus(${job.id}, this.value)">
        <option value="saved" ${job.status==='saved'?'selected':''}>Saved</option>
        <option value="applied" ${job.status==='applied'?'selected':''}>Applied</option>
        <option value="interview" ${job.status==='interview'?'selected':''}>Interview</option>
        <option value="rejected" ${job.status==='rejected'?'selected':''}>Rejected</option>
      </select>
    </div>
  `).join('');
}

window.updateStatus = async (id, status) => {
  await fetch(`${API_URL}/job-status`, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ id, status })
  });
};

loadJobs();