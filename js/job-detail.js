(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const jobId = params.get('id');
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@avenminds.com';

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[m]));
  }

  function renderDescription(desc) {
    // Convert our plain-text template (headings on their own line, "- " bullets) into HTML
    const blocks = desc.split(/\n\n+/);
    return blocks.map(block => {
      const lines = block.split('\n').filter(Boolean);
      if (!lines.length) return '';
      const first = lines[0].trim();
      const isHeading = lines.length === 1 && !first.startsWith('-') && first.split(' ').length <= 5 && !first.endsWith('.');
      if (isHeading) {
        return `<h4>${escapeHtml(first)}</h4>`;
      }
      const bulletLines = lines.filter(l => l.trim().startsWith('-'));
      if (bulletLines.length === lines.length) {
        return `<ul>${lines.map(l => `<li>${escapeHtml(l.replace(/^-\s*/, ''))}</li>`).join('')}</ul>`;
      }
      // mixed: first line may be heading-like sentence, rest bullets
      let html = '';
      lines.forEach(l => {
        if (l.trim().startsWith('-')) html += `<li>${escapeHtml(l.replace(/^-\s*/, ''))}</li>`;
        else html += `</ul><p>${escapeHtml(l)}</p><ul>`;
      });
      html = '<ul>' + html + '</ul>';
      html = html.replace(/<ul><\/ul>/g, '');
      return html;
    }).join('');
  }

  function modeClass(mode) {
    if (mode === 'Remote') return 'mode-remote';
    if (mode === 'Hybrid') return 'mode-hybrid';
    return '';
  }

  function renderJob(job, allJobs) {
    document.title = `${job.title} | AvenMinds Careers`;
    $('crumbTitle').textContent = job.title;

    const similar = allJobs.filter(j => j.category === job.category && j.id !== job.id).slice(0, 4);

    $('jobDetailRoot').innerHTML = `
      <div class="job-detail-wrap">
        <div class="job-detail-main">
          <div class="job-detail-header">
            <span class="eyebrow">${job.categoryLabel}</span>
            <h1>${job.title}</h1>
            <div class="job-detail-tags">
              <span class="job-tag ${modeClass(job.mode)}">${job.location}</span>
              <span class="job-tag">${job.mode}</span>
              <span class="job-tag">${job.employmentType}</span>
              <span class="job-tag exp">${job.experience} Experience</span>
            </div>
          </div>
          <div class="job-detail-body">${renderDescription(job.description)}</div>

          ${similar.length ? `
          <div style="margin-top:34px;padding-top:24px;border-top:1px solid #eef0f4;">
            <h4 style="color:#10233f;margin:0 0 14px;">Similar Roles You Might Like</h4>
            <div class="job-grid">
              ${similar.map(s => `
                <div class="job-card">
                  <div class="job-card-main">
                    <h3 class="job-card-title"><a href="job-detail.html?id=${s.id}">${s.title}</a></h3>
                    <div class="job-card-cat">${s.categoryLabel}</div>
                  </div>
                  <div class="job-card-tags">
                    <span class="job-tag ${modeClass(s.mode)}">${s.location}</span>
                    <span class="job-tag exp">${s.experience}</span>
                  </div>
                </div>
              `).join('')}
            </div>
          </div>` : ''}
        </div>

        <aside class="job-side-card">
          <h4>Role Overview</h4>
          <div class="job-side-row"><span>Job ID</span><span>${job.id}</span></div>
          <div class="job-side-row"><span>Location</span><span>${job.location}</span></div>
          <div class="job-side-row"><span>Work Mode</span><span>${job.mode}</span></div>
          <div class="job-side-row"><span>Employment Type</span><span>${job.employmentType}</span></div>
          <div class="job-side-row"><span>Experience</span><span>${job.experience}</span></div>
          <div class="job-side-row"><span>Department</span><span>${job.categoryLabel}</span></div>
          <div class="job-side-row"><span>Posted</span><span>${job.postedDaysAgo === 0 ? 'Today' : job.postedDaysAgo + ' days ago'}</span></div>
          <div class="job-side-actions">
            <a href="apply.html?id=${job.id}" class="btn btn-primary btn-block">Apply Now</a>
            <button class="btn btn-ghost btn-block" id="openReferBtn">Refer a Candidate</button>
          </div>
          <p class="job-share">Job ID: ${job.id} · Share this page's URL to send the role directly to someone.</p>
        </aside>
      </div>
    `;

    $('referRoleTitle').textContent = `Refer someone for ${job.title}`;
    $('referRoleInput').value = job.title + ' (' + job.id + ')';
    $('openReferBtn').addEventListener('click', () => {
      $('referModal').classList.add('open');
      document.body.style.overflow = 'hidden';
    });
  }

  function closeReferModal() {
    $('referModal').classList.remove('open');
    document.body.style.overflow = '';
  }
  $('referModalClose').addEventListener('click', closeReferModal);
  $('referModal').addEventListener('click', (e) => { if (e.target === $('referModal')) closeReferModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeReferModal(); });
  $('referSuccessClose').addEventListener('click', () => {
    closeReferModal();
    $('referForm').style.display = '';
    $('referSuccess').style.display = 'none';
    $('referForm').reset();
  });

  $('referForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = $('referSubmitBtn');
    const errorBox = $('referError');
    errorBox.classList.remove('show');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting…';
    try {
      const fd = new FormData($('referForm'));
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      $('referForm').style.display = 'none';
      $('referSuccess').style.display = 'block';
    } catch (err) {
      errorBox.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Referral';
    }
  });

  fetch('data/jobs.json')
    .then(r => r.json())
    .then(jobs => {
      const job = jobs.find(j => j.id === jobId) || jobs[0];
      if (!job) {
        $('jobDetailRoot').innerHTML = `<div class="empty-state"><h3>Job not found</h3><p>This role may have closed. <a href="careers.html">Browse all open roles →</a></p></div>`;
        return;
      }
      renderJob(job, jobs);
    })
    .catch(err => {
      $('jobDetailRoot').innerHTML = `<div class="empty-state"><h3>Couldn't load this job</h3><p>Please refresh the page.</p></div>`;
    });
})();
