(function () {
  const PAGE_SIZE = 20;
  let ALL_JOBS = [];
  let state = {
    q: '',
    category: new Set(),
    location: new Set(),
    mode: new Set(),
    experience: new Set(),
    employment: new Set(),
    sort: 'relevance',
    page: 1,
  };

  const CATEGORY_LABELS = {
    'it-and-software': 'IT & Software',
    'non-it-and-business': 'Non-IT & Business',
    'banking-and-finance': 'Banking & Finance',
    'teaching-and-training': 'Teaching & Training',
    'marketing-and-sales': 'Marketing & Sales',
    'hr-and-admin': 'HR & Admin',
    'media-and-production': 'Media & Production',
    'real-estate-and-construction': 'Real Estate & Construction',
    'logistics-and-supply-chain': 'Logistics & Supply Chain',
    'customer-support-and-operations': 'Customer Support & Operations',
  };

  const els = {};

  function $(id) { return document.getElementById(id); }

  function readURLState() {
    const p = new URLSearchParams(location.search);
    if (p.get('q')) state.q = p.get('q');
    if (p.get('cat')) state.category.add(p.get('cat'));
  }

  function distinctCounts(field) {
    const counts = {};
    ALL_JOBS.forEach(j => { counts[j[field]] = (counts[j[field]] || 0) + 1; });
    return counts;
  }

  function buildFilterGroup(containerId, field, opts) {
    const container = $(containerId);
    const counts = distinctCounts(field);
    const keys = opts.order || Object.keys(counts).sort();
    container.innerHTML = keys.filter(k => counts[k]).map(key => {
      const label = opts.labelFor ? opts.labelFor(key) : key;
      const id = `f_${field}_${key}`.replace(/[^a-zA-Z0-9_]/g, '');
      return `<label class="filter-check" for="${id}">
        <input type="checkbox" id="${id}" value="${key}">
        <span>${label}</span>
        <span class="count">${counts[key]}</span>
      </label>`;
    }).join('');
    container.querySelectorAll('input[type="checkbox"]').forEach(cb => {
      cb.addEventListener('change', () => {
        if (cb.checked) state[opts.stateKey].add(cb.value);
        else state[opts.stateKey].delete(cb.value);
        state.page = 1;
        syncCheckboxesFromState();
        render();
      });
    });
  }

  function syncCheckboxesFromState() {
    [
      ['filterCategory', 'category'], ['filterLocation', 'location'],
      ['filterMode', 'mode'], ['filterExperience', 'experience'],
      ['filterEmployment', 'employment']
    ].forEach(([containerId, key]) => {
      $(containerId).querySelectorAll('input[type="checkbox"]').forEach(cb => {
        cb.checked = state[key].has(cb.value);
      });
    });
    document.querySelectorAll('.filter-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.filter === 'all' ? state.category.size === 0 : state.category.has(btn.dataset.filter));
    });
  }

  function buildQuickLocationSelect() {
    const counts = distinctCounts('location');
    const sel = $('quickLocation');
    Object.keys(counts).sort().forEach(loc => {
      const opt = document.createElement('option');
      opt.value = loc; opt.textContent = loc;
      sel.appendChild(opt);
    });
    sel.addEventListener('change', () => {
      state.location = sel.value ? new Set([sel.value]) : new Set();
      state.page = 1;
      syncCheckboxesFromState();
      render();
    });
  }

  function buildCategoryPills() {
    const bar = $('filterBar');
    Object.keys(CATEGORY_LABELS).forEach(cat => {
      const btn = document.createElement('button');
      btn.className = 'filter-btn';
      btn.dataset.filter = cat;
      btn.textContent = CATEGORY_LABELS[cat];
      bar.appendChild(btn);
    });
    bar.addEventListener('click', (e) => {
      const btn = e.target.closest('.filter-btn');
      if (!btn) return;
      if (btn.dataset.filter === 'all') {
        state.category.clear();
      } else {
        state.category = new Set([btn.dataset.filter]);
      }
      state.page = 1;
      syncCheckboxesFromState();
      render();
    });
  }

  function matches(job) {
    if (state.q) {
      const q = state.q.toLowerCase();
      const hay = (job.title + ' ' + job.categoryLabel + ' ' + job.location + ' ' + job.description).toLowerCase();
      if (!hay.includes(q)) return false;
    }
    if (state.category.size && !state.category.has(job.category)) return false;
    if (state.location.size && !state.location.has(job.location)) return false;
    if (state.mode.size && !state.mode.has(job.mode)) return false;
    if (state.experience.size && !state.experience.has(job.experience)) return false;
    if (state.employment.size && !state.employment.has(job.employmentType)) return false;
    return true;
  }

  function sortJobs(jobs) {
    const arr = jobs.slice();
    if (state.sort === 'newest') arr.sort((a, b) => a.postedDaysAgo - b.postedDaysAgo);
    else if (state.sort === 'title-az') arr.sort((a, b) => a.title.localeCompare(b.title));
    return arr;
  }

  function modeClass(mode) {
    if (mode === 'Remote') return 'mode-remote';
    if (mode === 'Hybrid') return 'mode-hybrid';
    return '';
  }

  function renderChips() {
    const chips = [];
    if (state.q) chips.push({ label: `"${state.q}"`, clear: () => { state.q = ''; $('searchInput').value = ''; } });
    state.category.forEach(c => chips.push({ label: CATEGORY_LABELS[c] || c, clear: () => state.category.delete(c) }));
    state.location.forEach(l => chips.push({ label: l, clear: () => state.location.delete(l) }));
    state.mode.forEach(m => chips.push({ label: m, clear: () => state.mode.delete(m) }));
    state.experience.forEach(x => chips.push({ label: x, clear: () => state.experience.delete(x) }));
    state.employment.forEach(e => chips.push({ label: e, clear: () => state.employment.delete(e) }));

    const container = $('activeChips');
    container.innerHTML = '';
    chips.forEach(c => {
      const span = document.createElement('span');
      span.className = 'chip';
      span.innerHTML = `${c.label} <button aria-label="Remove filter">✕</button>`;
      span.querySelector('button').addEventListener('click', () => {
        c.clear();
        state.page = 1;
        syncCheckboxesFromState();
        render();
      });
      container.appendChild(span);
    });
  }

  function renderPagination(totalPages) {
    const container = $('pagination');
    container.innerHTML = '';
    if (totalPages <= 1) return;
    const mkBtn = (label, page, opts = {}) => {
      const b = document.createElement('button');
      b.className = 'page-btn' + (opts.active ? ' active' : '');
      b.textContent = label;
      b.disabled = !!opts.disabled;
      b.addEventListener('click', () => { state.page = page; render(); window.scrollTo({ top: $('searchShell').offsetTop - 20, behavior: 'smooth' }); });
      return b;
    };
    container.appendChild(mkBtn('‹', Math.max(1, state.page - 1), { disabled: state.page === 1 }));
    const start = Math.max(1, state.page - 2);
    const end = Math.min(totalPages, start + 4);
    for (let p = start; p <= end; p++) {
      container.appendChild(mkBtn(String(p), p, { active: p === state.page }));
    }
    container.appendChild(mkBtn('›', Math.min(totalPages, state.page + 1), { disabled: state.page === totalPages }));
  }

  function render() {
    const filtered = sortJobs(ALL_JOBS.filter(matches));
    $('jobCount').textContent = `Showing ${filtered.length} open role${filtered.length === 1 ? '' : 's'} of ${ALL_JOBS.length}+`;
    renderChips();

    const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
    if (state.page > totalPages) state.page = totalPages;
    const pageItems = filtered.slice((state.page - 1) * PAGE_SIZE, state.page * PAGE_SIZE);

    const list = $('jobList');
    if (!pageItems.length) {
      list.innerHTML = `<div class="empty-state"><h3>No roles match your filters</h3><p>Try clearing a filter or searching a broader keyword.</p></div>`;
    } else {
      list.innerHTML = pageItems.map(job => `
        <div class="job-card">
          <div class="job-card-main">
            <h3 class="job-card-title"><a href="job-detail.html?id=${job.id}">${job.title}</a></h3>
            <div class="job-card-cat">${job.categoryLabel}</div>
          </div>
          <div class="job-card-tags">
            <span class="job-tag ${modeClass(job.mode)}">${job.location}</span>
            <span class="job-tag">${job.employmentType}</span>
            <span class="job-tag exp">${job.experience}</span>
          </div>
          <div class="job-card-posted">${job.postedDaysAgo === 0 ? 'Posted today' : `Posted ${job.postedDaysAgo}d ago`}</div>
          <div class="job-card-actions">
            <a class="btn btn-ghost btn-sm" href="job-detail.html?id=${job.id}">View</a>
            <a class="btn btn-primary btn-sm" href="apply.html?id=${job.id}">Apply Now</a>
          </div>
        </div>
      `).join('');
    }
    renderPagination(totalPages);
  }

  function init(jobs) {
    ALL_JOBS = jobs;
    readURLState();

    buildCategoryPills();
    buildQuickLocationSelect();
    buildFilterGroup('filterCategory', 'category', { stateKey: 'category', order: Object.keys(CATEGORY_LABELS), labelFor: k => CATEGORY_LABELS[k] || k });
    buildFilterGroup('filterLocation', 'location', { stateKey: 'location' });
    buildFilterGroup('filterMode', 'mode', { stateKey: 'mode' });
    buildFilterGroup('filterExperience', 'experience', { stateKey: 'experience', order: ['Fresher', '0–1 Yrs', '1–3 Yrs', '2–4 Yrs', '3–5 Yrs', '5–8 Yrs'] });
    buildFilterGroup('filterEmployment', 'employmentType', { stateKey: 'employment' });

    $('searchInput').value = state.q;
    $('searchInput').addEventListener('input', debounce(() => {
      state.q = $('searchInput').value.trim();
      state.page = 1;
      render();
    }, 250));
    $('searchBtn').addEventListener('click', () => {
      state.q = $('searchInput').value.trim();
      state.page = 1;
      render();
    });
    $('quickSort').addEventListener('change', (e) => { state.sort = e.target.value; render(); });
    $('resetFilters').addEventListener('click', () => {
      state = { q: '', category: new Set(), location: new Set(), mode: new Set(), experience: new Set(), employment: new Set(), sort: 'relevance', page: 1 };
      $('searchInput').value = '';
      $('quickLocation').value = '';
      $('quickSort').value = 'relevance';
      syncCheckboxesFromState();
      render();
    });

    syncCheckboxesFromState();
    render();
  }

  function debounce(fn, ms) {
    let t;
    return (...args) => { clearTimeout(t); t = setTimeout(() => fn(...args), ms); };
  }

  fetch('data/jobs.json')
    .then(r => r.json())
    .then(init)
    .catch(err => {
      $('jobList').innerHTML = `<div class="empty-state"><h3>Couldn't load job listings</h3><p>Please refresh the page. (${err.message})</p></div>`;
    });
})();
