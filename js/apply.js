(function () {
  const $ = (id) => document.getElementById(id);
  const params = new URLSearchParams(location.search);
  const jobId = params.get('id');
  const FORM_ENDPOINT = 'https://formsubmit.co/ajax/info@avenminds.com';
  const MAX_EDU = 5;
  let eduCount = 0;
  let currentStep = 1;
  let currentJob = null;

  /* ---------------- Load job context ---------------- */
  fetch('data/jobs.json')
    .then(r => r.json())
    .then(jobs => {
      currentJob = jobs.find(j => j.id === jobId) || null;
      if (currentJob) {
        $('crumbJob').textContent = currentJob.title;
        $('applyingForLabel').textContent = `Applying for · ${currentJob.categoryLabel}`;
        $('jobTitleHeading').textContent = `Apply — ${currentJob.title}`;
        $('applyRoleInput').value = `${currentJob.title} (${currentJob.id})`;
        $('applyJobIdInput').value = currentJob.id;
      } else {
        $('jobTitleHeading').textContent = 'Apply — General Application';
        $('applyRoleInput').value = 'General Application';
      }
    })
    .catch(() => {
      $('jobTitleHeading').textContent = 'Apply — General Application';
      $('applyRoleInput').value = 'General Application';
    });

  /* ---------------- Education blocks ---------------- */
  function eduBlockTemplate(index, removable) {
    return `
      <div class="edu-block" data-edu="${index}">
        <div class="edu-block-head">
          <strong>Qualification ${index}</strong>
          ${removable ? `<button type="button" class="edu-remove" data-remove="${index}">Remove</button>` : ''}
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label>Degree / Qualification ${index === 1 ? '*' : ''}</label>
            <input type="text" name="Education ${index} - Degree" placeholder="e.g. B.E Computer Science" ${index === 1 ? 'required' : ''}>
          </div>
          <div class="form-field">
            <label>Institution / University ${index === 1 ? '*' : ''}</label>
            <input type="text" name="Education ${index} - Institution" placeholder="e.g. Anna University" ${index === 1 ? 'required' : ''}>
          </div>
        </div>
        <div class="form-row-2">
          <div class="form-field">
            <label>Year of Passing</label>
            <input type="text" name="Education ${index} - Year" placeholder="e.g. 2023">
          </div>
          <div class="form-field">
            <label>Grade / CGPA / Percentage</label>
            <input type="text" name="Education ${index} - Grade" placeholder="e.g. 8.2 CGPA / 78%">
          </div>
        </div>
      </div>`;
  }

  function addEduBlock() {
    if (eduCount >= MAX_EDU) return;
    eduCount++;
    const wrap = document.createElement('div');
    wrap.innerHTML = eduBlockTemplate(eduCount, eduCount > 1);
    $('eduContainer').appendChild(wrap.firstElementChild);
    refreshEduButton();
  }

  function removeEduBlock(index) {
    const block = document.querySelector(`.edu-block[data-edu="${index}"]`);
    if (block) block.remove();
    renumberEduBlocks();
  }

  function renumberEduBlocks() {
    const blocks = Array.from(document.querySelectorAll('.edu-block'));
    eduCount = blocks.length;
    blocks.forEach((block, i) => {
      const idx = i + 1;
      block.dataset.edu = idx;
      block.querySelector('.edu-block-head strong').textContent = `Qualification ${idx}`;
      const removeBtn = block.querySelector('.edu-remove');
      if (idx === 1 && removeBtn) removeBtn.remove();
      if (idx > 1 && !removeBtn) {
        const btn = document.createElement('button');
        btn.type = 'button'; btn.className = 'edu-remove'; btn.dataset.remove = idx;
        btn.textContent = 'Remove';
        block.querySelector('.edu-block-head').appendChild(btn);
      }
      block.querySelectorAll('input').forEach(inp => {
        const suffix = inp.name.split(' - ')[1];
        inp.name = `Education ${idx} - ${suffix}`;
        if (suffix === 'Degree' || suffix === 'Institution') {
          if (idx === 1) inp.setAttribute('required', 'required');
          else inp.removeAttribute('required');
        }
      });
      block.querySelectorAll('label').forEach(lbl => {
        const base = lbl.textContent.replace(/\s\*$/, '');
        if ((base.startsWith('Degree') || base.startsWith('Institution')) && idx === 1) lbl.textContent = base + ' *';
        else if (base.startsWith('Degree') || base.startsWith('Institution')) lbl.textContent = base;
      });
    });
    refreshEduButton();
  }

  function refreshEduButton() {
    $('addEduBtn').style.display = eduCount >= MAX_EDU ? 'none' : '';
  }

  $('eduContainer').addEventListener('click', (e) => {
    const btn = e.target.closest('.edu-remove');
    if (!btn) return;
    removeEduBlock(btn.dataset.remove);
  });
  $('addEduBtn').addEventListener('click', addEduBlock);
  addEduBlock(); // seed first mandatory block

  /* ---------------- Stepper navigation ---------------- */
  function setStep(n) {
    currentStep = n;
    document.querySelectorAll('.step-panel').forEach(p => {
      p.style.display = (p.dataset.panel === String(n)) ? '' : 'none';
    });
    document.querySelectorAll('.step-item').forEach(item => {
      const s = Number(item.dataset.step);
      item.classList.toggle('active', s === n);
      item.classList.toggle('done', s < n);
    });
    window.scrollTo({ top: document.getElementById('stepper').offsetTop - 20, behavior: 'smooth' });
  }

  function validatePanel(panelNum) {
    let valid = true;
    let firstInvalid = null;
    const panel = document.querySelector(`.step-panel[data-panel="${panelNum}"]`);

    panel.querySelectorAll('.form-field').forEach(field => {
      const requiredInputs = field.querySelectorAll('input[required], select[required], textarea[required]');
      if (!requiredInputs.length) { field.classList.remove('invalid'); return; }
      let fieldValid = true;
      const radios = field.querySelectorAll('input[type="radio"][required]');
      if (radios.length) {
        fieldValid = !!field.querySelector('input[type="radio"]:checked');
      } else {
        requiredInputs.forEach(inp => {
          if (inp.type === 'file') { if (!inp.files || !inp.files.length) fieldValid = false; }
          else if (!inp.value || !inp.value.trim()) fieldValid = false;
        });
      }
      field.classList.toggle('invalid', !fieldValid);
      if (!fieldValid) { valid = false; if (!firstInvalid) firstInvalid = field; }
    });

    // Education first block mandatory fields (not wrapped with data-field but with .form-field)
    if (panelNum === 1) {
      const firstBlock = document.querySelector('.edu-block[data-edu="1"]');
      if (firstBlock) {
        firstBlock.querySelectorAll('.form-field').forEach(field => {
          const req = field.querySelectorAll('input[required]');
          let ok = true;
          req.forEach(inp => { if (!inp.value.trim()) ok = false; });
          field.classList.toggle('invalid', req.length > 0 && !ok);
          if (req.length && !ok) { valid = false; if (!firstInvalid) firstInvalid = field; }
        });
      }
    }

    if (panelNum === 3) {
      const agree = $('fTermsAgree');
      const ok = agree.checked;
      $('termsError').style.display = ok ? 'none' : 'block';
      if (!ok) { valid = false; firstInvalid = firstInvalid || $('termsError'); }
    }

    if (firstInvalid) firstInvalid.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return valid;
  }

  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', () => {
      if (!validatePanel(currentStep)) return;
      setStep(Number(btn.dataset.next));
    });
  });
  document.querySelectorAll('[data-prev]').forEach(btn => {
    btn.addEventListener('click', () => setStep(Number(btn.dataset.prev)));
  });

  $('toReviewBtn').addEventListener('click', () => {
    if (!validatePanel(3)) return;
    buildReview();
    setStep(4);
  });

  /* ---------------- Review ---------------- */
  function labelFromName(name) { return name; }

  function buildReview() {
    const form = $('applyForm');
    const groups = [
      { title: 'Personal Details', names: ['First Name', 'Last Name', 'Contact Number', 'Email', 'LinkedIn Profile', 'Gender', 'Citizen of Country', 'Current Location', 'Portfolio Link', 'How Did You Hear About Us'] },
      { title: 'Resume', names: ['Resume'] },
      { title: 'Company Questions', names: ['Work Authorization', 'Disability', 'Passport', 'Company Terms Compliance', 'Currently Employed', 'Notice Period', 'Expected CTC', 'Willing to Relocate', 'Previously Applied'] },
    ];

    let html = '';
    html += `<div class="review-block"><h4>Applying For <a class="review-edit-link" data-goto="1">Edit</a></h4>
      <div class="review-row"><span>Role</span><span>${$('applyRoleInput').value}</span></div></div>`;

    groups.forEach((g, gi) => {
      const goto = g.title === 'Company Questions' ? 2 : 1;
      let rows = '';
      g.names.forEach(n => {
        const el = form.elements[n];
        if (!el) return;
        let val = '';
        if (el instanceof RadioNodeList) {
          const checked = Array.from(el).find(r => r.checked);
          val = checked ? checked.value : '—';
        } else if (el.type === 'file') {
          val = el.files && el.files.length ? el.files[0].name : '—';
        } else {
          val = el.value ? el.value : '—';
        }
        rows += `<div class="review-row"><span>${n}</span><span>${val}</span></div>`;
      });
      html += `<div class="review-block"><h4>${g.title} <a class="review-edit-link" data-goto="${goto}">Edit</a></h4>${rows}</div>`;
    });

    // Education
    let eduRows = '';
    document.querySelectorAll('.edu-block').forEach(block => {
      const idx = block.dataset.edu;
      const degree = block.querySelector(`[name="Education ${idx} - Degree"]`)?.value || '—';
      const inst = block.querySelector(`[name="Education ${idx} - Institution"]`)?.value || '—';
      const year = block.querySelector(`[name="Education ${idx} - Year"]`)?.value || '—';
      const grade = block.querySelector(`[name="Education ${idx} - Grade"]`)?.value || '—';
      if (degree === '—' && inst === '—' && year === '—' && grade === '—') return;
      eduRows += `<div class="review-row"><span>Qualification ${idx}</span><span>${degree} · ${inst} · ${year} · ${grade}</span></div>`;
    });
    html += `<div class="review-block"><h4>Education History <a class="review-edit-link" data-goto="1">Edit</a></h4>${eduRows || '<div class="review-row"><span>—</span><span>—</span></div>'}</div>`;

    html += `<div class="review-block"><h4>Terms &amp; Conditions <a class="review-edit-link" data-goto="3">Edit</a></h4>
      <div class="review-row"><span>Agreed to Terms &amp; Privacy Policy</span><span>${$('fTermsAgree').checked ? 'Yes' : 'No'}</span></div></div>`;

    $('reviewContent').innerHTML = html;
    $('reviewContent').querySelectorAll('.review-edit-link').forEach(a => {
      a.addEventListener('click', () => setStep(Number(a.dataset.goto)));
    });
  }

  /* ---------------- Submit ---------------- */
  $('applyForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    if (!validatePanel(3)) { setStep(3); return; }
    const btn = $('finalSubmitBtn');
    const errBox = $('submitError');
    errBox.classList.remove('show');
    btn.disabled = true;
    btn.innerHTML = '<span class="spinner"></span> Submitting…';
    try {
      const fd = new FormData($('applyForm'));
      const res = await fetch(FORM_ENDPOINT, {
        method: 'POST',
        headers: { 'Accept': 'application/json' },
        body: fd,
      });
      if (!res.ok) throw new Error('Network response was not ok');
      const refId = 'AVM-' + Date.now().toString().slice(-8);
      $('appRefId').textContent = 'Application Reference: ' + refId;
      document.querySelectorAll('.step-panel').forEach(p => p.style.display = 'none');
      document.getElementById('stepper').style.display = 'none';
      document.querySelector('.step-panel[data-panel="success"]').style.display = '';
    } catch (err) {
      errBox.classList.add('show');
    } finally {
      btn.disabled = false;
      btn.innerHTML = 'Submit Application';
    }
  });

  setStep(1);
})();
